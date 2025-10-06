import Joi from 'joi';

export const registerSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required'
  }),
  password: Joi.string()
    .min(8)
    .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]'))
    .required()
    .messages({
      'string.min': 'Password must be at least 8 characters long',
      'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
      'any.required': 'Password is required'
    }),
  firstName: Joi.string().min(2).max(50).required().messages({
    'string.min': 'First name must be at least 2 characters long',
    'string.max': 'First name must not exceed 50 characters',
    'any.required': 'First name is required'
  }),
  lastName: Joi.string().min(2).max(50).required().messages({
    'string.min': 'Last name must be at least 2 characters long',
    'string.max': 'Last name must not exceed 50 characters',
    'any.required': 'Last name is required'
  }),
  dateOfBirth: Joi.date().max('now').required().messages({
    'date.max': 'Date of birth cannot be in the future',
    'any.required': 'Date of birth is required'
  }),
  gender: Joi.string().valid('MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY').required().messages({
    'any.only': 'Gender must be one of: MALE, FEMALE, OTHER, PREFER_NOT_TO_SAY',
    'any.required': 'Gender is required'
  }),
  height: Joi.number().min(100).max(250).required().messages({
    'number.min': 'Height must be at least 100 cm',
    'number.max': 'Height must not exceed 250 cm',
    'any.required': 'Height is required'
  }),
  weight: Joi.number().min(30).max(300).required().messages({
    'number.min': 'Weight must be at least 30 kg',
    'number.max': 'Weight must not exceed 300 kg',
    'any.required': 'Weight is required'
  }),
  activityLevel: Joi.string().valid('SEDENTARY', 'LIGHTLY_ACTIVE', 'MODERATELY_ACTIVE', 'VERY_ACTIVE', 'EXTRA_ACTIVE').required().messages({
    'any.only': 'Activity level must be one of: SEDENTARY, LIGHTLY_ACTIVE, MODERATELY_ACTIVE, VERY_ACTIVE, EXTRA_ACTIVE',
    'any.required': 'Activity level is required'
  }),
  goals: Joi.array().items(
    Joi.string().valid('WEIGHT_LOSS', 'WEIGHT_GAIN', 'MUSCLE_GAIN', 'FAT_LOSS', 'ENDURANCE', 'STRENGTH', 'GENERAL_FITNESS', 'ATHLETIC_PERFORMANCE')
  ).min(1).required().messages({
    'array.min': 'At least one goal must be selected',
    'any.required': 'Goals are required'
  }),
  allergies: Joi.array().items(Joi.string()).default([]),
  dietType: Joi.string().valid('BALANCED', 'KETO', 'PALEO', 'VEGETARIAN', 'VEGAN', 'MEDITERRANEAN', 'LOW_CARB', 'HIGH_PROTEIN', 'INTERMITTENT_FASTING', 'CUSTOM').required().messages({
    'any.only': 'Diet type must be one of the valid options',
    'any.required': 'Diet type is required'
  })
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required'
  }),
  password: Joi.string().required().messages({
    'any.required': 'Password is required'
  })
});

export const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required'
  })
});

export const resetPasswordSchema = Joi.object({
  token: Joi.string().required().messages({
    'any.required': 'Reset token is required'
  }),
  password: Joi.string()
    .min(8)
    .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]'))
    .required()
    .messages({
      'string.min': 'Password must be at least 8 characters long',
      'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
      'any.required': 'Password is required'
    })
});

export const emailVerificationSchema = Joi.object({
  token: Joi.string().required().messages({
    'any.required': 'Verification token is required'
  })
});

export const resendVerificationSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required'
  })
});