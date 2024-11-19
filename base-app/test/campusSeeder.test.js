const { generateStudentData } = require('@db/studentSeeder');

describe('generateStudentData', () => {
  it('should generate a student with valid fields', () => {
    const mockCampus = { name: 'Test University', id: 1 };
    const student = generateStudentData(mockCampus);

    expect(student).toHaveProperty('firstName');
    expect(student).toHaveProperty('lastName');
    expect(student).toHaveProperty('email');
    expect(student).toHaveProperty('gpa');
    expect(student).toHaveProperty('campusId');
    expect(student.email).toContain('@testuniversity.edu');
    expect(student.campusId).toBe(1);
    expect(student.gpa).toBeGreaterThanOrEqual(0.0);
    expect(student.gpa).toBeLessThanOrEqual(4.0);
  });
});
