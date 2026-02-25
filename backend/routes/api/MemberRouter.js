const express = require('express');
const router = express.Router();
const AuthController = require('../../controllers/AuthController');
const validator = require('../../utils/Validation');
const auth = require('../../middleware/AuthMiddleware');
const MemberController = require('../../controllers/MemberController');
const { imageUpload } = require('../../utils/FileUploader');

router.post(
    '/register',
    [
        imageUpload.single("avatar"),
        validator.reqStringValidator('email'),
        validator.reqStringValidator('fullName'),
        validator.reqStringValidator('password'),
    ],
    AuthController.register
)
router.post(
    '/login',
    [
        validator.reqStringValidator('email'),
        validator.reqStringValidator('password'),
    ],
    AuthController.login
)

router.get(
    '/my-account',
    auth,
    AuthController.account
)
router.post(
    '/getAmount',
    MemberController.amount
)
router.post(
    '/logout',
    AuthController.logout
)
router.post(
    "/set-profile-with-image",
    auth,
    [
        imageUpload.single("avatar"),
        validator.reqStringValidator('fullName'),
    ],
    MemberController.setProfile
)
router.post(
    "/set-profile-without-image",
    auth,
    [
        validator.reqStringValidator('fullName'),
    ],
    MemberController.setProfile
)

router.post(
    '/withdraw',
    auth,
    MemberController.withdraw
)

router.post(
    '/deposit',
    auth,
    MemberController.deposit
)

router.get(
    '/getWithdraw',
    auth,
    MemberController.getWithdraw
)

router.get(
    '/getDeposit',
    auth,
    MemberController.getDeposit
)

module.exports = router;