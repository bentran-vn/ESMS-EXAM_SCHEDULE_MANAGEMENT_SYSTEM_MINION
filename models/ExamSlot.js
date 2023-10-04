import sequelize from "../database/database.js";
import { DataTypes } from "sequelize";
import ExamPhase from "./ExamPhase.js";
import TimeSlot from "./TimeSlot.js";

let tableName = 'examSlots'

const ExamSlot = sequelize.define(tableName, {
    ePId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: ExamPhase,
            key: 'id'
        }
    },
    timeSlotId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: TimeSlot,
            key: 'id'
        }
    },
    day: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },
});

ExamPhase.hasMany(ExamSlot, { foreignKey: 'ePId' })
ExamSlot.belongsTo(ExamPhase, { foreignKey: 'ePId' })

TimeSlot.hasMany(ExamSlot, { foreignKey: 'timeSlotId' })
ExamSlot.belongsTo(TimeSlot, { foreignKey: 'timeSlotId' })

ExamSlot.sync().then(() => {
    console.log(`${tableName} table is created`);
})

export default ExamSlot