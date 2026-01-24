const allRoles = {
  farmer: ['viewOwnProfile', 'submitCropSurvey', 'submitLossReport', 'viewOwnCases'],
  officer: ['viewOwnProfile', 'verifyCases', 'conductPanchanama', 'viewAssignedCases', 'manageFarmers'],
  authority: ['viewOwnProfile', 'viewAnalytics', 'viewAllCases', 'viewOfficerPerformance', 'reviewPanchanama'],
  admin: ['getUsers', 'manageUsers', 'viewAnalytics', 'manageRoles'],
};

const roles = Object.keys(allRoles);
const roleRights = new Map(Object.entries(allRoles));

module.exports = {
  roles,
  roleRights,
};
