// services/conditionAssignmentService.js
import mongoose from "mongoose";
import { CONDITIONS } from "../constants/conditionConstants.js";

// Define a schema for tracking condition assignments
const conditionAssignmentSchema = new mongoose.Schema({
  condition: String,
  count: Number,
});

// Create a model for condition assignments
const ConditionAssignment = mongoose.model(
  "ConditionAssignment",
  conditionAssignmentSchema
);

// Initialize the condition counters for personalized conditions
export const initializeConditionCounters = async () => {
  try {
    // Initialize counters for the two personalized conditions
    const personalizedConditions = [
      CONDITIONS.PERSONALIZED_WITH_EXPLANATION,
      CONDITIONS.PERSONALIZED_WITHOUT_EXPLANATION,
    ];

    for (const condition of personalizedConditions) {
      const exists = await ConditionAssignment.findOne({ condition });
      if (!exists) {
        await ConditionAssignment.create({ condition, count: 0 });
        console.log(`📊 Initialized counter for ${condition}`);
      }
    }
  } catch (error) {
    console.error("❌ Error initializing condition counters:", error);
  }
};

// Function to determine which personalized condition to assign
export const getBalancedPersonalizedCondition = async () => {
  try {
    // Get current assignment counts for both personalized conditions
    const withExplanationCount = await ConditionAssignment.findOne({
      condition: CONDITIONS.PERSONALIZED_WITH_EXPLANATION,
    });

    const withoutExplanationCount = await ConditionAssignment.findOne({
      condition: CONDITIONS.PERSONALIZED_WITHOUT_EXPLANATION,
    });

    // Determine which condition has fewer assignments
    let selectedCondition;
    if (
      (withExplanationCount?.count || 0) <=
      (withoutExplanationCount?.count || 0)
    ) {
      selectedCondition = CONDITIONS.PERSONALIZED_WITH_EXPLANATION;
    } else {
      selectedCondition = CONDITIONS.PERSONALIZED_WITHOUT_EXPLANATION;
    }

    // Increment the counter for the selected condition
    await ConditionAssignment.findOneAndUpdate(
      { condition: selectedCondition },
      { $inc: { count: 1 } },
      { new: true }
    );

    console.log(`✅ Assigned balanced condition: ${selectedCondition}`);
    console.log(
      `📊 Current counts - With Explanation: ${
        (withExplanationCount?.count || 0) +
        (selectedCondition === CONDITIONS.PERSONALIZED_WITH_EXPLANATION ? 1 : 0)
      }, Without Explanation: ${
        (withoutExplanationCount?.count || 0) +
        (selectedCondition === CONDITIONS.PERSONALIZED_WITHOUT_EXPLANATION
          ? 1
          : 0)
      }`
    );

    return selectedCondition;
  } catch (error) {
    console.error("❌ Error assigning balanced condition:", error);
    // Default fallback to personalized with explanation
    return CONDITIONS.PERSONALIZED_WITH_EXPLANATION;
  }
};
