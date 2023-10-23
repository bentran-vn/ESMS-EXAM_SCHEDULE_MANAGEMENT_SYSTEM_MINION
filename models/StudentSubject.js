import sequelize from "../database/database.js";
import { DataTypes } from "sequelize";
import Student from "./Student.js"
import Subject from "./Subject.js";

let tableName = 'studentSubject'

const StudentSubject = sequelize.define(tableName, {
    subjectId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Subject,
            key: 'id'
        }
    },
    stuId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Student,
            key: 'id'
        }
    },
    ePName: {
        type: DataTypes.STRING,
        allowNull: null
    }, // buộc phải giống với exam phase name của phase tương ứng
});

Subject.hasMany(StudentSubject, { foreignKey: 'subjectId' })
StudentSubject.belongsTo(Subject, { foreignKey: 'subjectId' })

Student.hasMany(StudentSubject, { foreignKey: 'stuId' })
StudentSubject.belongsTo(Student, { foreignKey: 'stuId' })

await StudentSubject.sync().then(() => {
    console.log(`${tableName} table is ready`);
})

export default StudentSubject