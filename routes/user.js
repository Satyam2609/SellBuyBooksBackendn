import { Router } from "express";
import { logginUser, logout, registerUser } from "../Controller/user.Controller.js";
import { uploads } from "../middleware/upload.js";
import { authProvider } from "../middleware/authProvider.js";
import { cartCreate, deletecart, getCart, getprofile } from "../Controller/profile.Controller.js";
import { jwtverify } from "../middleware/auth.js";
import { Bookdatafind, FindEngineeringBook, FindMedicalBook, getsellBook, selloldBookData, showSellBook } from "../Controller/Books.controller.js";
import { createOrder } from "../Controller/PayMentBook.js";
import { adminsignUp, anylitics, bookmanage, ordersDetails , ordersdatas } from "../Controller/Admin.js";
import { imagePrice } from "../Controller/Agent.js";


const router  = Router()

router.route("/Signup").post(uploads.single("avatar"),registerUser)
router.route("/login").post(logginUser)
router.route("/logout").put(jwtverify , logout)
router.route("/authprovider").get(authProvider)
router.route("/getProfile").get(jwtverify,getprofile)
router.route("/createdCart").post(uploads.single("image") ,jwtverify, cartCreate)
router.route("/BookData").get(Bookdatafind)
router.route("/getAllCart").get(jwtverify , getCart)
router.route("/create-order").post(jwtverify,createOrder)
router.route("/deleteCart").delete(jwtverify ,deletecart)
router.route("/medicalBook").get(FindMedicalBook)
router.route("/engineeringBook").get(FindEngineeringBook)
router.route("/sellBook").post(uploads.single("bookimage"),jwtverify ,selloldBookData)
router.route("/getsellbook").get(jwtverify , getsellBook)
router.route("/adminSignup").post(adminsignUp)
router.route("/ordersDetails").get(ordersDetails)
router.route("/ordersdatas").get(jwtverify,ordersdatas)
router.route("/showSellBook").get(showSellBook)
router.route("/anlytic").get(anylitics)
router.route("/bookmanage").get(bookmanage)


export default router