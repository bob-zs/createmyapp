const { faker } = require('@faker-js/faker');
const { 
  generateFullName,
  generateStateName, 
  generateCityName, 
  generateStreetAddress, 
  generateCatchPhrase 
} = require('../utils/randomUtil');

const getInstitutionType = () => {
  const types = ['University', 'College', 'Institute', 'Academy'];
  return types[Math.floor(Math.random() * types.length)];
};

const getPersonLastName = () => faker.person.lastName();
const getFieldOfStudy = () => {
  const fields = [
    'Science', 'Arts', 'Technology', 'Business', 'Engineering', 'Fashion', 
    'Marine Biology', 'Anthropology', 'Medicine', 'Law', 'Education'
  ];
  return fields[Math.floor(Math.random() * fields.length)];
};

const generateCampusName = (stateName) => {
  const institutionType = getInstitutionType();
  const cityName = generateCityName();
  const personLastName = getPersonLastName();
  const fieldOfStudy = getFieldOfStudy();
  const namePatterns = [
    `${cityName} ${institutionType}`,
    `${institutionType} of ${stateName}`,
    `${personLastName} ${institutionType}`,
    `${institutionType} of ${fieldOfStudy}`,
    `${institutionType} of ${fieldOfStudy} in ${stateName}`,
    `${personLastName} ${institutionType} of ${fieldOfStudy}`,
    `${personLastName} ${institutionType} in ${stateName}`,
    `${cityName} ${institutionType} of ${fieldOfStudy}`,
  ];
  return namePatterns[Math.floor(Math.random() * namePatterns.length)];
};

const generateCampusDescription = (name) => {
  const nameParts = name.split(' ');
  let fieldOfStudy = nameParts.includes('of') ? nameParts[nameParts.indexOf('of') + 1] : 'various fields';
  if (fieldOfStudy.includes(',')) fieldOfStudy = fieldOfStudy.split(',')[0];
  const year = Math.floor(Math.random() * (2000 - 1800 + 1)) + 1800;
  const milestone = generateCatchPhrase();
  const descriptionPatterns = [
    `Founded in ${year}, ${name} has long been a cornerstone in the education of ${fieldOfStudy}. Notable alumni include ${generateFullName()} and ${generateFullName()}.`,
    `Since ${year}, ${name} has been pioneering the field of ${fieldOfStudy}. Its modern facilities and distinguished faculty make it a premier institution.`,
    `${name}, established in ${year}, is renowned for its excellence in ${fieldOfStudy}. The campus boasts a rich history and a vibrant student life, with achievements like ${milestone}.`,
    `With a foundation dating back to ${year}, ${name} continues to excel in ${fieldOfStudy}. The institution prides itself on producing leaders and innovators in the field.`,
  ];
  return descriptionPatterns[Math.floor(Math.random() * descriptionPatterns.length)];
};

const generateImageUrl = (index) => {
  const keywords = ['college', 'university', 'education', 'campus', 'student', 'lecture', 'library', 'graduation'];
  const keyword = keywords[Math.floor(Math.random() * keywords.length)];
  return `https://loremflickr.com/400/400/${keyword}?lock=${index}`;
};

const generateCampusData = (index) => {
  const stateName = generateStateName();
  const name = generateCampusName(stateName);
  return {
    name,
    address: `${generateStreetAddress()}, ${stateName}`,
    description: generateCampusDescription(name),
    imageUrl: generateImageUrl(index),
  };
};

module.exports = { generateCampusData };
