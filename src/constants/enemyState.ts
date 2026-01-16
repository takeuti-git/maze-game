export enum PhysicalState {
    InHouse,
    LeavingHouse,
    Active,
}

export enum BehaviorState {
    Scatter,        // 角に向かう
    Chase,          // 追跡
    Frightened,     // 逃走
    Eaten           // 食べられた直後
}