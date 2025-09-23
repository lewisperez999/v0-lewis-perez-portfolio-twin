export function createErrorResponse(id: string | number, code: number, message: string, data?: any) {
  return {
    jsonrpc: '2.0',
    id,
    error: {
      code,
      message,
      ...(data && { data })
    }
  };
}

export function createSuccessResponse(id: string | number, result: any) {
  return {
    jsonrpc: '2.0',
    id,
    result
  };
}