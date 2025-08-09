// import { createRouter, defineEventHandler, useBase } from 'h3';
import { processRunsPrivateApi } from '~/server/services/processes_runs.services'


export default defineEventHandler(async (event) => {
    return processRunsPrivateApi.privateProcessRunsPost(event)
})