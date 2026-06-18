import logger, { generateRequestId } from '../utils/logger.js';

const requestContext = (req, res, next) => {
  const requestId = generateRequestId();
  req.requestId = requestId;
  req.log = logger.child({ requestId });
  res.setHeader('X-Request-Id', requestId);
  next();
};

export default requestContext;
