# Base64 File Upload

> Upload temporary files via Base64 encoded data. Note: Uploaded files are temporary and automatically deleted after 3 days.

## OpenAPI

````yaml file-upload-api/file-upload-api.json post /api/file-base64-upload
paths:
  path: /api/file-base64-upload
  method: post
  servers:
    - url: https://kieai.redpandaai.co
      description: API Server
  request:
    security:
      - title: BearerAuth
        parameters:
          query: {}
          header:
            Authorization:
              type: http
              scheme: bearer
              description: >-
                All APIs require authentication via Bearer Token.


                Get API Key:

                1. Visit [API Key Management Page](https://kie.ai/api-key) to
                get your API Key


                Usage:

                Add to request header:

                Authorization: Bearer YOUR_API_KEY
          cookie: {}
    parameters:
      path: {}
      query: {}
      header: {}
      cookie: {}
    body:
      application/json:
        schemaArray:
          - type: object
            properties:
              base64Data:
                allOf:
                  - type: string
                    description: >-
                      Base64 encoded file data. Supports pure Base64 strings or
                      data URL format
                    example: data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...
              uploadPath:
                allOf:
                  - type: string
                    description: File upload path, without leading or trailing slashes
                    example: images/base64
              fileName:
                allOf:
                  - type: string
                    description: >-
                      File name (optional), including file extension. If not
                      provided, a random file name will be generated. If the
                      same file name is uploaded again, the old file will be
                      overwritten, but changes may not take effect immediately
                      due to caching
                    example: my-image.png
            required: true
            refIdentifier: '#/components/schemas/Base64UploadRequest'
            requiredProperties:
              - base64Data
              - uploadPath
        examples:
          with_data_url:
            summary: Using data URL format
            value:
              base64Data: >-
                data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==
              uploadPath: images/base64
              fileName: test-image.png
          with_pure_base64:
            summary: Using pure Base64 string
            value:
              base64Data: >-
                iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==
              uploadPath: documents/uploads
  response:
    '200':
      application/json:
        schemaArray:
          - type: object
            properties:
              success:
                allOf:
                  - type: boolean
                    description: Whether the request was successful
              code:
                allOf:
                  - type: integer
                    enum:
                      - 200
                      - 400
                      - 401
                      - 405
                      - 500
                    description: >-
                      Response Status Code


                      | Code | Description |

                      |------|-------------|

                      | 200 | Success - Request has been processed successfully
                      |

                      | 400 | Bad Request - Request parameters are incorrect or
                      missing required parameters |

                      | 401 | Unauthorized - Authentication credentials are
                      missing or invalid |

                      | 405 | Method Not Allowed - Request method is not
                      supported |

                      | 500 | Server Error - An unexpected error occurred while
                      processing the request |
              msg:
                allOf:
                  - type: string
                    description: Response message
                    example: File uploaded successfully
              data:
                allOf:
                  - $ref: '#/components/schemas/FileUploadResult'
            requiredProperties:
              - success
              - code
              - msg
              - data
        examples:
          example:
            value:
              success: true
              code: 200
              msg: File uploaded successfully
              data:
                fileName: uploaded-image.png
                filePath: images/user-uploads/uploaded-image.png
                downloadUrl: >-
                  https://tempfile.redpandaai.co/xxx/images/user-uploads/uploaded-image.png
                fileSize: 154832
                mimeType: image/png
                uploadedAt: '2025-01-01T12:00:00.000Z'
        description: File uploaded successfully
    '400':
      application/json:
        schemaArray:
          - type: object
            properties:
              success:
                allOf:
                  - &ref_0
                    type: boolean
                    description: Whether the request was successful
              code:
                allOf:
                  - &ref_1
                    $ref: '#/components/schemas/StatusCode'
              msg:
                allOf:
                  - &ref_2
                    type: string
                    description: Response message
                    example: File uploaded successfully
            refIdentifier: '#/components/schemas/ApiResponse'
            requiredProperties: &ref_3
              - success
              - code
              - msg
        examples:
          missing_parameter:
            summary: Missing required parameter
            value:
              success: false
              code: 400
              msg: 'Missing required parameter: uploadPath'
          invalid_format:
            summary: Format error
            value:
              success: false
              code: 400
              msg: 'Base64 decoding failed: Invalid Base64 format'
        description: Request parameter error
    '401':
      application/json:
        schemaArray:
          - type: object
            properties:
              success:
                allOf:
                  - *ref_0
              code:
                allOf:
                  - *ref_1
              msg:
                allOf:
                  - *ref_2
            refIdentifier: '#/components/schemas/ApiResponse'
            requiredProperties: *ref_3
        examples:
          example:
            value:
              success: false
              code: 401
              msg: 'Authentication failed: Invalid API Key'
        description: Unauthorized access
    '500':
      application/json:
        schemaArray:
          - type: object
            properties:
              success:
                allOf:
                  - *ref_0
              code:
                allOf:
                  - *ref_1
              msg:
                allOf:
                  - *ref_2
            refIdentifier: '#/components/schemas/ApiResponse'
            requiredProperties: *ref_3
        examples:
          example:
            value:
              success: false
              code: 500
              msg: Internal server error
        description: Internal server error
  deprecated: false
  type: path
components:
  schemas:
    StatusCode:
      type: integer
      enum:
        - 200
        - 400
        - 401
        - 405
        - 500
      description: >-
        Response Status Code


        | Code | Description |

        |------|-------------|

        | 200 | Success - Request has been processed successfully |

        | 400 | Bad Request - Request parameters are incorrect or missing
        required parameters |

        | 401 | Unauthorized - Authentication credentials are missing or invalid
        |

        | 405 | Method Not Allowed - Request method is not supported |

        | 500 | Server Error - An unexpected error occurred while processing the
        request |
    FileUploadResult:
      type: object
      properties:
        fileName:
          type: string
          description: File name
          example: uploaded-image.png
        filePath:
          type: string
          description: Complete file path in storage
          example: images/user-uploads/uploaded-image.png
        downloadUrl:
          type: string
          format: uri
          description: File download URL
          example: >-
            https://tempfile.redpandaai.co/xxx/images/user-uploads/uploaded-image.png
        fileSize:
          type: integer
          description: File size in bytes
          example: 154832
        mimeType:
          type: string
          description: File MIME type
          example: image/png
        uploadedAt:
          type: string
          format: date-time
          description: Upload timestamp
          example: '2025-01-01T12:00:00.000Z'
      required:
        - fileName
        - filePath
        - downloadUrl
        - fileSize
        - mimeType
        - uploadedAt

````

# URL File Upload

## OpenAPI

````yaml file-upload-api/file-upload-api.json post /api/file-url-upload
paths:
  path: /api/file-url-upload
  method: post
  servers:
    - url: https://kieai.redpandaai.co
      description: API Server
  request:
    security:
      - title: BearerAuth
        parameters:
          query: {}
          header:
            Authorization:
              type: http
              scheme: bearer
              description: >-
                All APIs require authentication via Bearer Token.


                Get API Key:

                1. Visit [API Key Management Page](https://kie.ai/api-key) to
                get your API Key


                Usage:

                Add to request header:

                Authorization: Bearer YOUR_API_KEY
          cookie: {}
    parameters:
      path: {}
      query: {}
      header: {}
      cookie: {}
    body:
      application/json:
        schemaArray:
          - type: object
            properties:
              fileUrl:
                allOf:
                  - type: string
                    format: uri
                    description: File download URL, must be a valid HTTP or HTTPS address
                    example: https://example.com/images/sample.jpg
              uploadPath:
                allOf:
                  - type: string
                    description: File upload path, without leading or trailing slashes
                    example: images/downloaded
              fileName:
                allOf:
                  - type: string
                    description: >-
                      File name (optional), including file extension. If not
                      provided, a random file name will be generated. If the
                      same file name is uploaded again, the old file will be
                      overwritten, but changes may not take effect immediately
                      due to caching
                    example: sample-image.jpg
            required: true
            refIdentifier: '#/components/schemas/UrlUploadRequest'
            requiredProperties:
              - fileUrl
              - uploadPath
        examples:
          image_from_url:
            summary: Download image from URL
            value:
              fileUrl: https://example.com/images/sample.jpg
              uploadPath: images/downloaded
              fileName: my-downloaded-image.jpg
          document_from_url:
            summary: Download document from URL
            value:
              fileUrl: https://example.com/docs/manual.pdf
              uploadPath: documents/manuals
  response:
    '200':
      application/json:
        schemaArray:
          - type: object
            properties:
              success:
                allOf:
                  - type: boolean
                    description: Whether the request was successful
              code:
                allOf:
                  - type: integer
                    enum:
                      - 200
                      - 400
                      - 401
                      - 405
                      - 500
                    description: >-
                      Response Status Code


                      | Code | Description |

                      |------|-------------|

                      | 200 | Success - Request has been processed successfully
                      |

                      | 400 | Bad Request - Request parameters are incorrect or
                      missing required parameters |

                      | 401 | Unauthorized - Authentication credentials are
                      missing or invalid |

                      | 405 | Method Not Allowed - Request method is not
                      supported |

                      | 500 | Server Error - An unexpected error occurred while
                      processing the request |
              msg:
                allOf:
                  - type: string
                    description: Response message
                    example: File uploaded successfully
              data:
                allOf:
                  - $ref: '#/components/schemas/FileUploadResult'
            requiredProperties:
              - success
              - code
              - msg
              - data
        examples:
          example:
            value:
              success: true
              code: 200
              msg: File uploaded successfully
              data:
                fileName: uploaded-image.png
                filePath: images/user-uploads/uploaded-image.png
                downloadUrl: >-
                  https://tempfile.redpandaai.co/xxx/images/user-uploads/uploaded-image.png
                fileSize: 154832
                mimeType: image/png
                uploadedAt: '2025-01-01T12:00:00.000Z'
        description: File uploaded successfully
    '400':
      application/json:
        schemaArray:
          - type: object
            properties:
              success:
                allOf:
                  - &ref_0
                    type: boolean
                    description: Whether the request was successful
              code:
                allOf:
                  - &ref_1
                    $ref: '#/components/schemas/StatusCode'
              msg:
                allOf:
                  - &ref_2
                    type: string
                    description: Response message
                    example: File uploaded successfully
            refIdentifier: '#/components/schemas/ApiResponse'
            requiredProperties: &ref_3
              - success
              - code
              - msg
        examples:
          missing_parameter:
            summary: Missing required parameter
            value:
              success: false
              code: 400
              msg: 'Missing required parameter: uploadPath'
          invalid_format:
            summary: Format error
            value:
              success: false
              code: 400
              msg: 'Base64 decoding failed: Invalid Base64 format'
        description: Request parameter error
    '401':
      application/json:
        schemaArray:
          - type: object
            properties:
              success:
                allOf:
                  - *ref_0
              code:
                allOf:
                  - *ref_1
              msg:
                allOf:
                  - *ref_2
            refIdentifier: '#/components/schemas/ApiResponse'
            requiredProperties: *ref_3
        examples:
          example:
            value:
              success: false
              code: 401
              msg: 'Authentication failed: Invalid API Key'
        description: Unauthorized access
    '500':
      application/json:
        schemaArray:
          - type: object
            properties:
              success:
                allOf:
                  - *ref_0
              code:
                allOf:
                  - *ref_1
              msg:
                allOf:
                  - *ref_2
            refIdentifier: '#/components/schemas/ApiResponse'
            requiredProperties: *ref_3
        examples:
          example:
            value:
              success: false
              code: 500
              msg: Internal server error
        description: Internal server error
  deprecated: false
  type: path
components:
  schemas:
    StatusCode:
      type: integer
      enum:
        - 200
        - 400
        - 401
        - 405
        - 500
      description: >-
        Response Status Code


        | Code | Description |

        |------|-------------|

        | 200 | Success - Request has been processed successfully |

        | 400 | Bad Request - Request parameters are incorrect or missing
        required parameters |

        | 401 | Unauthorized - Authentication credentials are missing or invalid
        |

        | 405 | Method Not Allowed - Request method is not supported |

        | 500 | Server Error - An unexpected error occurred while processing the
        request |
    FileUploadResult:
      type: object
      properties:
        fileName:
          type: string
          description: File name
          example: uploaded-image.png
        filePath:
          type: string
          description: Complete file path in storage
          example: images/user-uploads/uploaded-image.png
        downloadUrl:
          type: string
          format: uri
          description: File download URL
          example: >-
            https://tempfile.redpandaai.co/xxx/images/user-uploads/uploaded-image.png
        fileSize:
          type: integer
          description: File size in bytes
          example: 154832
        mimeType:
          type: string
          description: File MIME type
          example: image/png
        uploadedAt:
          type: string
          format: date-time
          description: Upload timestamp
          example: '2025-01-01T12:00:00.000Z'
      required:
        - fileName
        - filePath
        - downloadUrl
        - fileSize
        - mimeType
        - uploadedAt

````