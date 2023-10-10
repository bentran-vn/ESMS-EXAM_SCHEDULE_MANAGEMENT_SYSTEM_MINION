import express from 'express'
import { DataResponse, InternalErrResponse, InvalidTypeResponse, MessageResponse, NotFoundResponse } from '../common/reponses.js'
import { requireRole } from '../middlewares/auth.js'
import ExamSlot from '../models/ExamSlot.js'
import Course from '../models/Course.js'
import SubInSlot from '../models/SubInSlot.js'
import ExamRoom from '../models/ExamRoom.js'
import { Op } from 'sequelize'


const router = express.Router()

/**
 * @swagger
 * components:
 *   schemas:
 *    SubInSlots:
 *       type: object
 *       required:
 *          - courId
 *          - exSlId
 *       properties:
 *          id:
 *              type: integer
 *              description: Auto generate id
 *          courId:
 *              type: integer
 *              description: Reference to Course id
 *          exSlId:
 *              type: integer
 *              description: Reference to ExamSlot id
 *       example:
 *           id: 1
 *           courId: 1
 *           exSlId: 1
 */

/**
 * @swagger
 * tags:
 *    name: SubInSlots
 *    description: The SubInSlots managing API
 */
/**
 * @swagger
 * /subInSlots/:
 *   post:
 *     summary: Create a new SubInSlot
 *     tags: [SubInSlots]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               courId:
 *                 type: integer
 *                 example: 1, 2, 3, 4
 *               exSlId:
 *                 type: integer
 *                 example: 1, 2, 3, 4
 *           required:
 *             - courId
 *             - exSlId
 *     responses:
 *       '200':
 *         description: Create Success !
 *       '500':
 *         description: Internal Server Error !
 */
/**
 * @swagger
 * /subInSlots/:
 *   delete:
 *     summary: Delete a Subject in SubInSlot and it's relative rows in ExamRoom
 *     tags: [SubInSlots]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               subId:
 *                 type: integer
 *                 example: 1, 2, 3, 4
 *           required:
 *             - subId
 *     responses:
 *       '200':
 *         description: All exam room of this subject are deleted / This subject hasn't have any exam room
 *       '500':
 *         description: Internal Server Error !
 */

router.post('/', async (req, res) => {
    const courId = parseInt(req.body.courId);
    const exSlId = parseInt(req.body.exSlId);

    try {
        const course = await Course.findOne({
            where: {
                id: courId
            }
        })
        const examSlot = await ExamSlot.findOne({
            where: {
                id: exSlId
            }
        })
        if (!course || !examSlot) {
            res.json(NotFoundResponse());
            return;
        } else {
            const subInSlot = await SubInSlot.create({
                courId: courId,
                exSlId: exSlId
            })
            console.log(subInSlot);
            res.json(MessageResponse("Create Success !"))
        }


    } catch (err) {
        console.log(err)
        res.json(InternalErrResponse());
    }
})

//bảng subInSlot này chứa courseId
//nhận subId => truy ra courseId => id của sub in slot cầm thg này đi xóa tất cả row cùng subinslotId sau đó quay lại xóa 
//id của subinslotid
router.delete('/', async (req, res) => {
    const subId = parseInt(req.body.subId); 

    try {
        const course = await Course.findOne({
            where: { subId: subId },
        })
        if(!course){
            res.json(MessageResponse("This subject is not exist!"))
            return;
        }

        const subjectInSlot = await SubInSlot.findAll({
            where: { courId: course.id }
        });

        const subInSlotArray = subjectInSlot.map(subInSlot => subInSlot.dataValues);
        const idArray = subInSlotArray.map(item => item.id); //lấy ra mảng các id của subInSlot có môn thi là courId = subId


        let rowAffected;
        if(idArray.length === 0){
            res.json(MessageResponse("This subject is not scheduled"));
            return;
        } else{
            rowAffected = await ExamRoom.destroy({
                where: { 
                    sSId: {
                        [Op.or] : idArray
                    } 
                }
            });
        }      
        if(rowAffected != 0){
            const lineAffected = await SubInSlot.destroy({
                where: {
                    courId: course.id
                }
            })
            if(lineAffected != 0){
                res.json(MessageResponse("All exam room of this subject are deleted"))
            } 
            return;   
        }else{
            res.json(MessageResponse("This subject hasn't have any exam room"));   
            const rows = await SubInSlot.destroy({
                where: {
                    courId: course.id
                }
            })    
            return; 
        }
    } catch (error) {
        console.error(error);
        res.json(InternalErrResponse());
    }
})
export default router