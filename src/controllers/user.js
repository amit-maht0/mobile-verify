const asyncHandler = require("express-async-handler");
const UserCollection = require("../models/User");
const { generateToken } = require("../services/auth");
const cookie = require("cookie");

const client = require("twilio")(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH
);

/**
 * API to create user and send OTP via Twilio
 * If user already exists then don't create user, checking if number is verified or not
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @returns
 */
exports.createUser = async (req, res, next) => {
  const { name, email, phone } = req.body;

  try {
    let user = await UserCollection.findOne({
      email: email,
      phone: phone,
    });

    if (user && user.isVerified) {
      return res.status(400).json({
        message: "Phone number is already verified!",
      });
    }
    const verificationCode = await generateCode();

    const message = await client.messages.create({
      body: `Hello ${name} !, Your verification code is :${verificationCode}. It will expire after 2 min.`,
      from: "+12052256453",
      to: `+91${phone}`,
    });

    if (user) {
      user.otp = verificationCode;
      user.codeSentAt = new Date();
      await user.save();
    } else {
      await UserCollection.create({
        name: name,
        email: email,
        phone: phone,
        otp: verificationCode,
        codeSentAt: new Date(),
      });
    }

    let createdUser = await UserCollection.findOne({
      email: email,
      phone: phone,
    });

    // generating token for user

    const token = await generateToken(createdUser);

    //storing token in cookie and redirecting to verify page
    return res.cookie("token", token).redirect("/verify");
  } catch (error) {
    res.status(400).json({
      error: "Invalid!",
    });
  }
};

/**
 * function for generating OTP
 * @returns
 */
async function generateCode() {
  return Math.floor(10000 + Math.random() * 90000);
}

/**
 * Validating OTP sent from verify page
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @returns
 */

exports.validateNumber = async (req, res, next) => {
  let phone = parseInt(req.body.phone);
  let otp = parseInt(req.body.otp);

  const cookies = cookie.parse(req.headers.cookie || "");

  // Check if the "token" cookie exists
  let tokenData = await decodeToken(cookies);
  try {
    let user = await UserCollection.findOne({ phone: phone });
    if (!user || user.isVerified) {
      return res.status(400).json({
        status: false,
        message: "Invalid phone number or phone number already verified.",
      });
    }

    //Verifying user intered OTP
    if (user.otp !== otp) {
      return res
        .status(400)
        .json({ status: false, message: "Invalid verification code." });
    }

    const currentDate = new Date();
    const codeSentAt = new Date(user.codeSentAt);
    const timeDiff = (currentDate - codeSentAt) / 60000;

    //Checking if OTP expired after 2 min
    if (timeDiff > 2) {
      res.status(400).json({
        status: false,
        message: "Verification code expired, request OTP again!",
      });
    }
    user.isVerified = true;
    await user.save();
    res
      .status(200)
      .json({ status: true, message: "Phone number verified successfully." });
  } catch (error) {
    res.status(400).json({ message: "Failed to verify phone number." });
  }
};

/**
 * For rendering Verify page and siplay few data from token stored in cookie
 * @param {*} req
 * @param {*} res
 */
exports.renderVerify = async (req, res) => {
  const cookies = cookie.parse(req.headers.cookie || "");

  // Check if the "token" cookie exists
  let tokenData = await decodeToken(cookies);

  res.render("verify", { tokenData });
};

/**
 * Function to decode cookie
 * @param {*} cookies
 * @returns
 */

async function decodeToken(cookies) {
  let tokenData;
  if (cookies.token) {
    token = cookies.token;
    const payload = token.split(".")[1];
    const decodedPayload = Buffer.from(payload, "base64").toString("utf-8");
    tokenData = JSON.parse(decodedPayload);
  }
  return tokenData;
}
