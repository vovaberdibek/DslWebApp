Agents:
    Robot1
    Robot2
    HumanOP1
    AMR1

Locations:
    Table: {position: [1.252, -0.12, 0.004], orientation: [0, 0, -1.57]}
    RechargeArea: {position: [0.952, -0.29248, 1.1356], orientation: [0, 0, 0]}
    OperatorStation: {position: [1.0, 1.0, 1.55], orientation: [0, 0, 3.14]}
    AssemblyArea: {position: [0, -1.43, 0.75], orientation: [0, 0, 1.57]}


Trays:
    AOCS_Tray: {
        tray: AOC
        units:[
            { name: MTQ12, pose_index: 0 },
            { name: MTQ3_MAG, pose_index: 1 },
            { name: CMG2, pose_index: 2 },
            { name: CMG1, pose_index: 4 },
            { name: CMG34, pose_index: 6 }
            ]
        screws: [96 x M4]
        height: 0.25
        initial_pose: [1.01, -0.21, 0.78, 0, 0, 1.57]
        operator_pose: [1.2, 1.1, 1.55, 0, 0, 3.14]
        final_pose: [0, -1.43, 0.75, 0, 0, 1.57]
    }
    

Parameters:
    TipOffset: [-0.299605, 0, 0.260354]
    TrayAngles: [0.314, 0.785] 
    TrayDownSteps: [0, 1, 3, 5, 7, 10, 12, 14]
    RotationSteps: [6, 7, 13, 14]
    TrayFinalPose: [0.0, -1.43, 0.751, 0.0, 0.0, 1.57]
    TrayPoseOperator: [-1.570796, -1.570796, 3.141593, 1.010160, 1.000000, 1.550000]
    RestPose: [0.8, -0.8, 1.370354, 0, 0, -0.785]
    PrePickPose: [1.01, -0.21, 1.4595, 1.57, 1.57, 1.57]
    PostPickPose: [1.01, -0.21, 1.8595, 1.57, 1.57, 1.57]
    PreRechargePose: [0.952, -0.29248, 1.1156, 0, 0, 0]
    PreEndPose: [0, -1.43, 2.2, 0, 0, -0.785]
    TrayHeights: [0.25, 0.2515, 0.2]                 
    OriginToBottomDistances: [0.056]                
    TrayInitOffset: [-0.24184, 0.23975]              


TrayStepPoses: [
    [-1.57, 0.0, -1.884, 1.20, -0.07, 1.75],
    [-1.57, -1.57, -1.884, 1.20, -0.07, 1.75],
    [-1.571, 1.57, 1.256, 1.32, -0.19, 1.75],
    [-1.57, 1.57, -1.884, 1.20, -0.07, 1.75],
    [-1.57, -1.57, 1.256, 1.32, -0.19, 1.75],
    [-1.57, -1.57, -1.884, 1.20, -0.07, 1.75],
    [-1.57, 3.14, 1.571, 1.32, -0.19, 1.75],
    [-1.57, 3.14, -1.884, 1.20, -0.07, 1.75],
    [-1, -1, -1, -1, -1, -1],
    [-1.57, 1.57, 1.256, 1.32, -0.19, 1.75],
    [-1.57, 1.57, -1.884, 1.18, -0.05, 1.75],
    [-1.57, -1.57, 1.256, 1.32, -0.19, 1.75],
    [-1.57, -1.57, -1.884, 1.18, -0.05, 1.75],
    [-1.57, 3.14, 1.571, 1.32, -0.19, 1.75],
    [-1.57, 3.14, -1.884, 1.18, -0.05, 1.75],
    [-1, -1, -1, -1, -1, -1]
]

MainPoses:
    Table: [1.252, -0.12, 0.004, 0.0, 0.0, -1.57]
    TrayInit: [1.01016, 0.11975, 0.0, 0.0, 0.0, 1.57]
    BottomPanelInit: [1.01016, 0.11975, 1.10925, 0.0, 0.0, 1.57]
    BottomPick: [1.010160, 0.119750, 1.894250, 1.57, 1.57, 1.57]
    Recharge: [0.4004, -0.29248, 1.136, 0.0, 0.0, 0.0]
    Rest: [0.8, -0.8, 1.369, 0.0, 0.0, -0.785]
    Pick: [1.01016, 0.11975, 1.55225, 1.57, 1.57, 1.57]
    PrePick: [1.01016, 0.11975, 1.95375, 1.57, 1.57, 1.57]
    PostPick: [1.010160, 0.119750, 2.353750, 1.57, 1.57, 1.57]
    End: [0.0, -1.43, 0.7865, 0, 1.57, 0]
    PreEnd: [0.0, -1.43, 2.582, 0, 1.57, 0]

Assembly:
    manual AddTray2("tray_aoc", "CMG2") 
    manual PickTray(0) Speed=0.6
    manual OperatorPositionTray(0) Speed=0.5
    manual PositionTray(0) Speed=0.6
    manual RechargeSequence(0) Speed=0.5
    manual InternalScrewingSequence(2) Speed=0.4
    manual AddTray2("tray_aoc", "CMG1") 
    manual OperatorPositionTray(0) Speed=0.5
    manual PositionTray(3) Speed=0.6
    manual RechargeSequence(3) Speed=0.5
    manual InternalScrewingSequence(3) Speed=0.4
    manual AddTray2("tray_aoc", "CMG34") 
    manual OperatorPositionTray(0) Speed=0.5
    manual PositionTray(4) Speed=0.6
    manual RechargeSequence(4) Speed=0.5
    manual InternalScrewingSequence(4) Speed=0.4                     
    manual PlaceTray(0)

    manual AddTray2("tray_dhc", "") 
    manual PickTray(0) Speed=0.6
    manual OperatorPositionTray(0) Speed=0.5   
    manual PositionTray(0) Speed=0.6
    manual RechargeSequence(0) Speed=0.5
    manual InternalScrewingSequence(0) Speed=0.4
    manual PlaceTray(0)
    

    manual AddTray2("tray_eps", "BAT1")
    manual PickTray(5) Speed=0.6
    manual OperatorPositionTray(0) Speed=0.5    
    manual PositionTray(5) Speed=0.6
    manual RechargeSequence(5) Speed=0.5
    manual InternalScrewingSequence(5) Speed=0.4
    manual AddTray2("tray_eps", "BAT2")                 
    manual PickTray(6) Speed=0.6
    manual OperatorPositionTray(0) Speed=0.5
    manual PositionTray(6) Speed=0.6
    manual RechargeSequence(6) Speed=0.5
    manual InternalScrewingSequence(6) Speed=0.4
    manual AddTray2("tray_eps", "PCDU") 
    manual OperatorPositionTray(0) Speed=0.5
    manual PositionTray(7) Speed=0.6
    manual RechargeSequence(7) Speed=0.5
    manual InternalScrewingSequence(7) Speed=0.4
    manual PlaceTray(7)

    manual AddTray2("tray_payload", "") 
    manual PickTray(0) Speed=0.6
    manual OperatorPositionTray(0) Speed=0.5   
    manual PositionTray(0) Speed=0.6
    manual RechargeSequence(0) Speed=0.5
    manual InternalScrewingSequence(0) Speed=0.4
    manual PlaceTray(0)



