'use strict';

const express = require('express');
const { asyncHandler } = require('./middleware/async-handler');
const { User, Course } = require('./models');
const { authenticateUser } = require('./middleware/auth-user');

// Construct a router instance.
const router = express.Router();

// USER ROUTES
// Route that returns the current authenticated user.
router.get('/users', authenticateUser, asyncHandler(async (req, res) => {

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
    res.status(201).location('/').end();
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
    attributes: {
      exclude: [
        'createdAt',
        'updatedAt'
      ]
    },
    include: [{
      model: User,
      as: 'user',
      attributes: {
        exclude: [
          'password',
          'createdAt',
          'updatedAt'
        ]
      },
    }],
  });
  res.json(courses).status(200);

}));

// Route that will return the corresponding course including the User associated with that course
router.get('/courses/:id', asyncHandler(async(req,res)=>{

  const course = await Course.findOne({
    attributes: {
      exclude: [
        'createdAt',
        'updatedAt'
      ]
    },
    where: {
      id: req.params.id
    },
    include: [{
      model: User,
      as: 'user',
      attributes: {
        exclude: [
          'password',
          'createdAt',
          'updatedAt'
        ]
      },
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
router.post('/courses', authenticateUser, async(req,res)=>{
  try {
    const course = await Course.create(req.body);
    res.status(201).location(`/courses/${course.id}`).end();
  }
  catch (error) {
    if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
      const errors = error.errors.map(err => err.message);
      res.status(400).json({ errors });   
    } else {
      throw error;
    }
  }
  
});

// Route that will update the corresponding course
router.put('/courses/:id', authenticateUser, asyncHandler(async(req,res)=>{

  try {
    const course = await Course.findByPk(req.params.id);
    if(course) {
      if (req.currentUser.id === course.userId) {
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
      res.status(204).end();
      } else {
        res.status(403).json({errors: 'User does not have permission to update this course.'})
      }
    } else {
      res.status(404).end()
    }
  } catch (error) {
    if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
      const errors = error.errors.map(err => err.message);
      res.status(400).json({ errors });   
    } else {
      throw error;
    }
  }
  
}));

// Route that will delete the corresponding course
router.delete('/courses/:id', authenticateUser, asyncHandler(async(req,res)=>{

  try {
    const course = await Course.findByPk(req.params.id);
    if(course) {
      if (req.currentUser.id === course.userId) {
        await Course.destroy({
          where: {
            id: req.params.id
          }
        });
        res.status(204).end();
      } else {
        res.status(403).json({errors: 'User does not have permission to delete this course.'})
      }
    }
  } catch (error) {
    if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
      const errors = error.errors.map(err => err.message);
      res.status(400).json({ errors });   
    } else {
      throw error;
    }
  }

}));

module.exports = router;