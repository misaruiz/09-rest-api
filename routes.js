'use strict';

const express = require('express');
const { asyncHandler } = require('./middleware/async-handler');
const { User, Course } = require('./models');
// const { authenticateUser } = require('./middleware/auth-user');
const course = require('./models/course');

// Construct a router instance.
const router = express.Router();

// USER ROUTES
// Route that returns the current authenticated user.
router.get('/users', asyncHandler(async (req, res) => {

    const user = req.currentUser;
    res
    .json({
        firstName: user.firstName,
        lastName: user.lastName,
        emailAddress: user.emailAddress,
    })
    .status(200);

  }));

// Route that creates a new user.
router.post('/users', asyncHandler(async (req, res) => {

    try {
      await User.create(req.body);
      res.status(201).json({ "message": "Account successfully created!" });
    } catch (error) {
      if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
        const errors = error.errors.map(err => err.message);
        res.status(400).json({ errors });   
      } else {
        throw error;
      }
    }

  }));


// COURSE ROUTES
// Route that returns all courses including the User associated with each course
router.get('/courses', asyncHandler(async(req,res)=>{

  const courses = await Course.findAll({
    include: [{
      model: User,
      as: 'user',
    }],
  });
  res.json(courses).status(200);

}));

// Route that will return the corresponding course including the User associated with that course
router.get('/courses/:id', asyncHandler(async(req,res)=>{

  const course = await Course.findOne({
    where: {
      id: req.params.id
    },
    include: [{
      model: User,
      as: 'user',
    }],
  });

  if (course) {
    res.json(course).status(200);
  } else {
    const error = 'Course does not exist.';
    res.status(400).json({error});
  }

}));

// Route that will create a new course
router.post('/courses', asyncHandler(async(req,res)=>{

    const course = await Course.create(req.body);
    res.status(201).location(`/courses/${course.id}`).end();
  
}));

// Route that will update the corresponding course
router.put('/courses/:id', asyncHandler(async(req,res)=>{

  await Course.update({ 
    title: req.body.title,
    description: req.body.description,
    estimatedTime: req.body.estimatedTime,
    materialsNeeded: req.body.materialsNeeded
  }, {
    where: {
      id: req.params.id
    }
  });
  res.status(204)
  
}));

// Route that will delete the corresponding course
router.delete('/courses/:id', asyncHandler(async(req,res)=>{

  await Course.destroy({
    where: {
      id: req.params.id
    }
  });

}));

  module.exports = router;