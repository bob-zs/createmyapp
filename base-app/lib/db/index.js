const Sequelize = require('sequelize');

const { generateCampusData } = require('@db/campusSeeder');
const { generateStudentData } = require('@db/studentSeeder');

const { DECIMAL, STRING, TEXT } = Sequelize;
const db = new Sequelize(process.env.DATABASE_URL || 'postgres://localhost:5432/acme_schools_db');
const notEmptyValidation = { notEmpty: true };


const Campus = db.define('campus', {
  name: {
    type: STRING,
    allowNull: false,
    validate: notEmptyValidation,
  },
  address: {
    type: STRING,
    allowNull: false,
    validate: notEmptyValidation,
  },
  description: {
    type: TEXT,
  },
  imageUrl: {
    type: STRING,
  },
});

const Student = db.define('student', {
  firstName: {
    type: STRING,
    allowNull: false,
    validate: notEmptyValidation,
  },
  lastName: {
    type: STRING,
    allowNull: false,
    validate: notEmptyValidation,
  },
  email: {
    type: STRING,
    allowNull: false,
    validate: {
      ...notEmptyValidation,
      isEmail: true,
    },
  },
  gpa: {
    type: DECIMAL,
    validate: {
      min: 0.0,
      max: 4.0,
    },
  },
}, {
  hooks: {
    beforeUpdate: async (student, options) => {
      const needsNewEmail = options.fields.includes('campusId');
      if (!needsNewEmail) return;
      const hasCampus = student.campusId !== null;
      if (hasCampus) {
        const studentCampus = await Campus.findByPk(student.campusId);
        await student.update({ email: generateStudentData(student, studentCampus).email });
        return;
      }
      await student.update({ email: generateStudentData(student).email, gpa: null });
    }
  }
});

Student.belongsTo(Campus);
Campus.hasMany(Student);

const numberOfCampuses = 5;
const numberOfStudents = 10;

const syncAndSeed = async function () {
  await db.sync({ force: true });

  // Generate campuses
  const campuses = await Campus.bulkCreate(
    Array.from({ length: numberOfCampuses }).map((_, index) => generateCampusData(index))
  );

  // Generate students ensuring each campus has at least one student
  const studentsPerCampus = Math.floor(numberOfStudents / numberOfCampuses);
  const extraStudents = numberOfStudents % numberOfCampuses;

  const studentDataArray = [];
  campuses.forEach(campus => {
    for (let i = 0; i < studentsPerCampus; i++) {
      studentDataArray.push(generateStudentData(campus));
    }
  });

  // Distribute remaining students randomly
  for (let i = 0; i < extraStudents; i++) {
    const randomCampus = campuses[Math.floor(Math.random() * campuses.length)];
    studentDataArray.push(generateStudentData(randomCampus));
  }

  // Seed students
  await Student.bulkCreate(studentDataArray);

  console.log(`Seeded ${campuses.length} campuses and ${studentDataArray.length} students`);
};

module.exports = syncAndSeed;
