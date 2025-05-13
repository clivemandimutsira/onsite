// src/services/splitService.js

const db = require('../models/config/db');
const { createCellGroup, updateCellGroup } = require('../models/cellGroupModel');
const { getMembershipsByCellGroupId, updateMembership } = require('../models/memberCellGroupModel');

/**
 * Splits a cell group into N new groups based on the rule.
 * Evenly distributes members into the new groups, updates the database,
 * and logs the results.
 */
async function splitCellGroup(oldGroupId, splitInto) {
  try {
    // 1. Fetch current group members
    const { rows: members } = await getMembershipsByCellGroupId(oldGroupId);
    if (!members.length) {
      console.log(`No members found in group ${oldGroupId}. Skipping split.`);
      return;
    }

    // 2. Compute size per new group
    const perGroup = Math.ceil(members.length / splitInto);

    // 3. Get old group info
    const oldGroupQuery = await db.query(
      'SELECT name, address, leader_id FROM cell_groups WHERE id = $1',
      [oldGroupId]
    );

    const oldGroup = oldGroupQuery.rows[0];
    if (!oldGroup) {
      console.error(`Group ${oldGroupId} not found.`);
      return;
    }

    // 4. Create new groups
    const newGroupIds = [];

    for (let i = 1; i <= splitInto; i++) {
      const newName = `${oldGroup.name} - Part ${i}`;

      const result = await db.query(
        'INSERT INTO cell_groups (name, address, leader_id) VALUES ($1, $2, $3) RETURNING id;',
        [newName, oldGroup.address, oldGroup.leader_id]
      );

      newGroupIds.push(result.rows[0].id);
    }

    // 5. Reassign members to new groups
    for (let i = 0; i < members.length; i++) {
      const targetGroupId = newGroupIds[Math.floor(i / perGroup)];
      await updateMembership(members[i].id, { cell_group_id: targetGroupId });
    }

    // 6. Delete old group
    await db.query('DELETE FROM cell_groups WHERE id = $1', [oldGroupId]);

    console.log(`Split group ${oldGroupId} into ${splitInto} parts:`, newGroupIds);

  } catch (error) {
    console.error(`Error during group split for group ${oldGroupId}:`, error.message);
    throw error;
  }
}

/**
 * Evaluates a group against rules and triggers splitting if needed.
 */
exports.evaluateGroupForSplit = async (cellGroupId) => {
  try {
    // 1. Count members
    const sizeRes = await db.query(
      'SELECT COUNT(*) FROM member_cell_group WHERE cell_group_id = $1',
      [cellGroupId]
    );

    const size = parseInt(sizeRes.rows[0].count, 10);

    // 2. Lookup rule
    const ruleRes = await db.query(
      'SELECT * FROM cell_group_rules WHERE $1 BETWEEN min_size AND max_size LIMIT 1;',
      [size]
    );

    const rule = ruleRes.rows[0];
    if (!rule) {
      console.log(`No applicable split rule for group ${cellGroupId} with size ${size}`);
      return;
    }

    // 3. Perform split if necessary
    if (rule.split_into > 1) {
      await splitCellGroup(cellGroupId, rule.split_into);
    } else {
      console.log(`Group ${cellGroupId} meets rule but no split required (split_into = ${rule.split_into}).`);
    }

  } catch (error) {
    console.error(`Failed to evaluate group ${cellGroupId} for split:`, error.message);
    throw error;
  }
};
