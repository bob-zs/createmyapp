const { generateFirstName, generateLastName, generateGpa } = require('../utils/randomUtil');

const generateStudentData = (campus) => {
  const emailDomain = campus.name.toLowerCase().replace(/\s/g, '') + '.edu';
  return {
    firstName: generateFirstName(),
    lastName: generateLastName(),
    email: `${generateFirstName()}.${generateLastName()}@${emailDomain}`,
    gpa: generateGpa(),
    campusId: campus.id,
  };
};

module.exports = { generateStudentData };
