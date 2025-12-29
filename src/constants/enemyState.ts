export enum EnemyPhysicalState {
    InHouse,
    LeavingHouse,
    Active,
    Returning
}

export enum EnemyBehaviorState {
    Scatter,        // 角に向かう
    Chase,          // 追跡
    Frightened,     // 逃走
    Eaten           // 食べられた直後
}