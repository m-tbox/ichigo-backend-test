import request from 'supertest'
import { GET_REWARD_ERROR_MSG } from '../../constants'
import { StatusCode } from '../enums/apiEnums'
import app from '../app'

describe('Rewards Apis', () => {
    describe('GET weekly rewards', () => {
        it('should return array of reward objects', () => {
            return request(app)
                .get('/users/1/rewards?at=2022-02-10T12:00:00Z')
                .expect(StatusCode.OK)
                .then(response => {

                    /**
                     * Check if api response matches an object that has a key data.
                     * And in data objet there is an array of rewards.
                     * As response have 7 rewards in array we created an array with 7 enteries  
                     */
                    expect(response.body).toMatchObject({
                        data: new Array(7).fill({
                            availableAt: expect.any(String),
                            redeemedAt: null,
                            expiresAt: expect.any(String)
                        }),
                    })
                })
        })

        it('should return invalid date error', () => {
            return request(app)
                .get('/users/1/rewards?at=2022-40-10T12:00:00Z')
                .expect(StatusCode.BAD_REQUEST)
                .then(response => {

                    // Date 2022-40-10 is invalid so response should return proper message
                    expect(response.body).toEqual(
                        expect.objectContaining({
                            error: {
                                message: GET_REWARD_ERROR_MSG.inavlidData
                            },
                        })
                    )
                })
        })

        it('should return error that date is missing in param or is invalid', () => {
            return request(app)
                .get('/users/1/rewards')
                .expect(StatusCode.BAD_REQUEST)
                .then(response => {
                    expect(response.body).toEqual(
                        expect.objectContaining({
                            error: {
                                message: GET_REWARD_ERROR_MSG.inavlidData
                            },
                        })
                    )
                })
        })
    })
})