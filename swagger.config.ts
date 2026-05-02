import { createSwaggerSpec } from 'next-swagger-doc'

export const getApiDocs = () =>
  createSwaggerSpec({
    apiFolder: 'src/app/api',
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'Carbon Dashboard API',
        version: '1.0.0',
        description: 'PCF(제품 탄소 발자국) 관리 플랫폼 REST API',
      },
      tags: [
        { name: 'activities', description: '활동 데이터 CRUD' },
        { name: 'emissions', description: '배출량 집계 및 분석' },
        { name: 'upload', description: 'Excel 파일 업로드' },
        { name: 'emission-factors', description: '배출계수 관리' },
      ],
    },
  })
