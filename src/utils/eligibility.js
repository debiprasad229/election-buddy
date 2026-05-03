/**
 * Validates voter eligibility based on age and citizenship.
 * @param {number|string} age - The user's age
 * @param {boolean} isCitizen - Whether the user is an Indian citizen
 * @returns {{isValid: boolean, error: string|null}}
 */
export const checkEligibility = (age, isCitizen) => {
  const parsedAge = parseInt(age);
  
  if (!age || isNaN(parsedAge) || parsedAge < 18) {
    return { isValid: false, error: 'age_error' };
  }
  
  if (!isCitizen) {
    return { isValid: false, error: 'citizenship_error' };
  }
  
  return { isValid: true, error: null };
};
