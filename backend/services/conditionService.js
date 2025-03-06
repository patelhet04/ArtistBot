// services/conditionService.js
import { CONDITIONS } from "../constants/conditionConstants.js";
import SurveyResponse from "../models/SurveyResponse.js";
import { getBalancedPersonalizedCondition } from "./conditionAssignmentService.js";

/**
 * Maps a URL condition parameter to the appropriate internal condition
 * @param {string} urlCondition - The condition from the URL
 * @param {string} userId - The user's ID
 * @returns {Promise<string>} - The internal condition name
 */
export const mapUrlConditionToInternal = async (urlCondition, userId) => {
  // If URL explicitly specifies 'general', use the general condition
  if (urlCondition === "general") {
    return CONDITIONS.GENERAL;
  }

  // Find user in database to determine if they are personalized
  const userResponse = await SurveyResponse.findOne({ userId });
  const isPersonalized = !!userResponse;

  // Non-personalized users should always get the general condition
  if (!isPersonalized) {
    return CONDITIONS.GENERAL;
  }

  // For personalized URL parameter, handle the assignment
  if (urlCondition === "personalized") {
    // Check if user already has an assigned condition
    if (userResponse.assignedCondition) {
      return userResponse.assignedCondition;
    } else {
      // New personalized user, assign balanced condition
      return await getBalancedPersonalizedCondition();
    }
  }

  // If it's already an explicit internal condition, use it directly
  if (Object.values(CONDITIONS).includes(urlCondition)) {
    return urlCondition;
  }

  // If we got here and the user is personalized but has no condition yet,
  // assign them a balanced personalized condition
  if (isPersonalized && !userResponse.assignedCondition) {
    return await getBalancedPersonalizedCondition();
  }

  // Default fallback to general
  return CONDITIONS.GENERAL;
};
