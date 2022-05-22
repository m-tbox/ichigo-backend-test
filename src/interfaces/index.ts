export interface Reward {
    availableAt: Date;
    redeemedAt: Date | null;
    expiresAt: Date
}


/**
 * Rewards hash map will have user keys. 
 * And on each user key there will be an array or rewards for that user
 */
export interface RewardsList {
    [id: string]: Array<Reward>
}