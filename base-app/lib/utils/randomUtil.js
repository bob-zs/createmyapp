const { faker } = require('@faker-js/faker');

const generateFirstName = () => faker.person.firstName();
const generateLastName = () => faker.person.lastName();
const generateFullName = () => `${generateFirstName()} ${generateLastName()}`;
const generateGpa = () => faker.number.float({ min: 0.0, max: 4.0, precision: 0.01 });
const generateStateName = () => faker.location.state();
const generateCityName = () => faker.location.city();
const generateStreetAddress = () => faker.location.streetAddress();
const generateCatchPhrase = () => faker.company.catchPhrase();

module.exports = {
  generateFirstName,
  generateLastName,
  generateFullName,
  generateGpa,
  generateStateName,
  generateCityName,
  generateStreetAddress,
  generateCatchPhrase,
};
