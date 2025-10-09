// =====================================================
// CHAT VALIDATION UTILITIES
// =====================================================
// Validation functions for chat data models and user inputs

import {
  Message,
  MessageType,
  MessageMetadata,
  LocationMetadata,
  PhotoMetadata,
  ValidationResult,
  MessageValidation,
  UUID,
  QuickActionType,
} from '../types/chat';

// =====================================================
// CONSTANTS
// =====================================================

export const VALIDATION_LIMITS = {
  MESSAGE_MAX_LENGTH: 1000,
  MESSAGE_MIN_LENGTH: 1,
  USERNAME_MAX_LENGTH: 50,
  USERNAME_MIN_LENGTH: 2,
  CHAT_TITLE_MAX_LENGTH: 100,
  FILE_MAX_SIZE: 10 * 1024 * 1024, // 10MB
  LOCATION_ACCURACY_MAX: 1000, // meters
} as const;

export const ALLOWED_MESSAGE_TYPES: MessageType[] = ['text', 'location', 'status', 'photo'];

export const ALLOWED_QUICK_ACTIONS: QuickActionType[] = [
  'on-my-way',
  'running-late', 
  'arrived',
  'share-location',
  'take-photo'
];

export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg', 
  'image/png',
  'image/webp'
] as const;

// =====================================================
// BASIC VALIDATION UTILITIES
// =====================================================

/**
 * Check if a string is a valid UUID
 */
export const isValidUUID = (value: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(value);
};

/**
 * Check if a string is a valid ISO timestamp
 */
export const isValidTimestamp = (value: string): boolean => {
  const date = new Date(value);
  return !isNaN(date.getTime()) && date.toISOString() === value;
};

/**
 * Check if a value is a non-empty string
 */
export const isNonEmptyString = (value: any): value is string => {
  return typeof value === 'string' && value.trim().length > 0;
};

/**
 * Check if a value is a valid number within range
 */
export const isValidNumber = (value: any, min?: number, max?: number): value is number => {
  if (typeof value !== 'number' || isNaN(value)) return false;
  if (min !== undefined && value < min) return false;
  if (max !== undefined && value > max) return false;
  return true;
};

// =====================================================
// MESSAGE VALIDATION
// =====================================================

/**
 * Validate message content
 */
export const validateMessageContent = (content: string): MessageValidation => {
  if (!isNonEmptyString(content)) {
    return {
      isValid: false,
      error: 'Message content is required',
    };
  }

  const trimmedContent = content.trim();

  if (trimmedContent.length < VALIDATION_LIMITS.MESSAGE_MIN_LENGTH) {
    return {
      isValid: false,
      error: 'Message cannot be empty',
    };
  }

  if (trimmedContent.length > VALIDATION_LIMITS.MESSAGE_MAX_LENGTH) {
    return {
      isValid: false,
      error: `Message is too long (max ${VALIDATION_LIMITS.MESSAGE_MAX_LENGTH} characters)`,
    };
  }

  // Check for potentially harmful content
  if (containsHarmfulContent(trimmedContent)) {
    return {
      isValid: false,
      error: 'Message contains inappropriate content',
    };
  }

  return {
    isValid: true,
    sanitizedContent: sanitizeMessageContent(trimmedContent),
  };
};

/**
 * Validate message type
 */
export const validateMessageType = (type: string): ValidationResult => {
  if (!ALLOWED_MESSAGE_TYPES.includes(type as MessageType)) {
    return {
      isValid: false,
      error: `Invalid message type. Allowed types: ${ALLOWED_MESSAGE_TYPES.join(', ')}`,
    };
  }

  return { isValid: true };
};

/**
 * Validate complete message object
 */
export const validateMessage = (message: Partial<Message>): ValidationResult => {
  // Required fields
  if (!message.chat_id || !isValidUUID(message.chat_id)) {
    return {
      isValid: false,
      error: 'Valid chat ID is required',
    };
  }

  if (!message.user_id || !isValidUUID(message.user_id)) {
    return {
      isValid: false,
      error: 'Valid user ID is required',
    };
  }

  if (!message.content) {
    return {
      isValid: false,
      error: 'Message content is required',
    };
  }

  // Validate content
  const contentValidation = validateMessageContent(message.content);
  if (!contentValidation.isValid) {
    return contentValidation;
  }

  // Validate message type
  if (message.message_type) {
    const typeValidation = validateMessageType(message.message_type);
    if (!typeValidation.isValid) {
      return typeValidation;
    }
  }

  // Validate metadata based on message type
  if (message.metadata) {
    const metadataValidation = validateMessageMetadata(
      message.metadata,
      message.message_type || 'text'
    );
    if (!metadataValidation.isValid) {
      return metadataValidation;
    }
  }

  return { isValid: true };
};

// =====================================================
// METADATA VALIDATION
// =====================================================

/**
 * Validate message metadata based on message type
 */
export const validateMessageMetadata = (
  metadata: MessageMetadata,
  messageType: MessageType
): ValidationResult => {
  if (!metadata || typeof metadata !== 'object') {
    return { isValid: true }; // Metadata is optional
  }

  switch (messageType) {
    case 'location':
      return validateLocationMetadata(metadata.location);
    
    case 'photo':
      return validatePhotoMetadata(metadata.photo);
    
    case 'status':
      return validateStatusMetadata(metadata.status);
    
    case 'text':
    default:
      return { isValid: true };
  }
};

/**
 * Validate location metadata
 */
export const validateLocationMetadata = (location?: LocationMetadata): ValidationResult => {
  if (!location) {
    return {
      isValid: false,
      error: 'Location data is required for location messages',
    };
  }

  if (!isValidNumber(location.lat, -90, 90)) {
    return {
      isValid: false,
      error: 'Invalid latitude (must be between -90 and 90)',
    };
  }

  if (!isValidNumber(location.lng, -180, 180)) {
    return {
      isValid: false,
      error: 'Invalid longitude (must be between -180 and 180)',
    };
  }

  if (location.accuracy !== undefined && !isValidNumber(location.accuracy, 0, VALIDATION_LIMITS.LOCATION_ACCURACY_MAX)) {
    return {
      isValid: false,
      error: `Invalid location accuracy (must be between 0 and ${VALIDATION_LIMITS.LOCATION_ACCURACY_MAX} meters)`,
    };
  }

  return { isValid: true };
};

/**
 * Validate photo metadata
 */
export const validatePhotoMetadata = (photo?: PhotoMetadata): ValidationResult => {
  if (!photo) {
    return {
      isValid: false,
      error: 'Photo data is required for photo messages',
    };
  }

  if (!isNonEmptyString(photo.photo_url)) {
    return {
      isValid: false,
      error: 'Photo URL is required',
    };
  }

  // Validate URL format
  try {
    new URL(photo.photo_url);
  } catch {
    return {
      isValid: false,
      error: 'Invalid photo URL format',
    };
  }

  // Validate optional dimensions
  if (photo.width !== undefined && !isValidNumber(photo.width, 1, 10000)) {
    return {
      isValid: false,
      error: 'Invalid photo width',
    };
  }

  if (photo.height !== undefined && !isValidNumber(photo.height, 1, 10000)) {
    return {
      isValid: false,
      error: 'Invalid photo height',
    };
  }

  // Validate file size
  if (photo.file_size !== undefined && !isValidNumber(photo.file_size, 1, VALIDATION_LIMITS.FILE_MAX_SIZE)) {
    return {
      isValid: false,
      error: `Photo file size too large (max ${VALIDATION_LIMITS.FILE_MAX_SIZE / (1024 * 1024)}MB)`,
    };
  }

  return { isValid: true };
};

/**
 * Validate status metadata
 */
export const validateStatusMetadata = (status?: any): ValidationResult => {
  if (!status) {
    return {
      isValid: false,
      error: 'Status data is required for status messages',
    };
  }

  if (!ALLOWED_QUICK_ACTIONS.includes(status.status)) {
    return {
      isValid: false,
      error: `Invalid status type. Allowed types: ${ALLOWED_QUICK_ACTIONS.join(', ')}`,
    };
  }

  if (status.timestamp && !isValidTimestamp(status.timestamp)) {
    return {
      isValid: false,
      error: 'Invalid timestamp format',
    };
  }

  return { isValid: true };
};

// =====================================================
// CHAT VALIDATION
// =====================================================

/**
 * Validate chat ID
 */
export const validateChatId = (chatId: string): ValidationResult => {
  if (!isNonEmptyString(chatId)) {
    return {
      isValid: false,
      error: 'Chat ID is required',
    };
  }

  if (!isValidUUID(chatId)) {
    return {
      isValid: false,
      error: 'Invalid chat ID format',
    };
  }

  return { isValid: true };
};

/**
 * Validate user ID
 */
export const validateUserId = (userId: string): ValidationResult => {
  if (!isNonEmptyString(userId)) {
    return {
      isValid: false,
      error: 'User ID is required',
    };
  }

  if (!isValidUUID(userId)) {
    return {
      isValid: false,
      error: 'Invalid user ID format',
    };
  }

  return { isValid: true };
};

// =====================================================
// FILE VALIDATION
// =====================================================

/**
 * Validate image file for photo messages
 */
export const validateImageFile = (file: {
  uri: string;
  type?: string;
  size?: number;
}): ValidationResult => {
  if (!file.uri) {
    return {
      isValid: false,
      error: 'File URI is required',
    };
  }

  // Validate file type
  if (file.type && !ALLOWED_IMAGE_TYPES.includes(file.type as any)) {
    return {
      isValid: false,
      error: `Invalid image type. Allowed types: ${ALLOWED_IMAGE_TYPES.join(', ')}`,
    };
  }

  // Validate file size
  if (file.size && file.size > VALIDATION_LIMITS.FILE_MAX_SIZE) {
    return {
      isValid: false,
      error: `File size too large (max ${VALIDATION_LIMITS.FILE_MAX_SIZE / (1024 * 1024)}MB)`,
    };
  }

  return { isValid: true };
};

// =====================================================
// CONTENT SANITIZATION
// =====================================================

/**
 * Sanitize message content
 */
export const sanitizeMessageContent = (content: string): string => {
  return content
    .trim()
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // Remove control characters
    .substring(0, VALIDATION_LIMITS.MESSAGE_MAX_LENGTH);
};

/**
 * Check for potentially harmful content
 */
export const containsHarmfulContent = (content: string): boolean => {
  const harmfulPatterns = [
    // Basic patterns - extend as needed
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
  ];

  return harmfulPatterns.some(pattern => pattern.test(content));
};

// =====================================================
// QUICK ACTION VALIDATION
// =====================================================

/**
 * Validate quick action type
 */
export const validateQuickAction = (action: string): ValidationResult => {
  if (!ALLOWED_QUICK_ACTIONS.includes(action as QuickActionType)) {
    return {
      isValid: false,
      error: `Invalid quick action. Allowed actions: ${ALLOWED_QUICK_ACTIONS.join(', ')}`,
    };
  }

  return { isValid: true };
};

// =====================================================
// BATCH VALIDATION
// =====================================================

/**
 * Validate multiple messages at once
 */
export const validateMessages = (messages: Partial<Message>[]): {
  valid: Partial<Message>[];
  invalid: Array<{ message: Partial<Message>; error: string }>;
} => {
  const valid: Partial<Message>[] = [];
  const invalid: Array<{ message: Partial<Message>; error: string }> = [];

  messages.forEach(message => {
    const validation = validateMessage(message);
    if (validation.isValid) {
      valid.push(message);
    } else {
      invalid.push({
        message,
        error: validation.error || 'Unknown validation error',
      });
    }
  });

  return { valid, invalid };
};

// =====================================================
// PERMISSION VALIDATION
// =====================================================

/**
 * Check if user can send messages in chat
 */
export const canSendMessage = (userId: UUID, chatMembers: any[]): boolean => {
  return chatMembers.some(member => 
    member.user_id === userId && member.is_active === true
  );
};

/**
 * Check if user can send photos
 */
export const canSendPhoto = (userId: UUID, chatMembers: any[]): boolean => {
  // For now, same as message permission
  return canSendMessage(userId, chatMembers);
};

/**
 * Check if user can share location
 */
export const canShareLocation = (userId: UUID, chatMembers: any[]): boolean => {
  // For now, same as message permission
  return canSendMessage(userId, chatMembers);
};

/**
 * Check if user can leave chat
 */
export const canLeaveChat = (userId: UUID, sessionHostId: UUID): boolean => {
  // Users can leave unless they are the host
  return userId !== sessionHostId;
};

// =====================================================
// VALIDATION ERROR HELPERS
// =====================================================

/**
 * Create a standardized validation error
 */
export const createValidationError = (field: string, message: string): ValidationResult => {
  return {
    isValid: false,
    error: `${field}: ${message}`,
  };
};

/**
 * Combine multiple validation results
 */
export const combineValidationResults = (results: ValidationResult[]): ValidationResult => {
  const errors = results
    .filter(result => !result.isValid)
    .map(result => result.error)
    .filter(Boolean);

  if (errors.length > 0) {
    return {
      isValid: false,
      error: errors.join('; '),
    };
  }

  return { isValid: true };
};