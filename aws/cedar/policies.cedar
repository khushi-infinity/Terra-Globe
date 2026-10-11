// AWS Cedar Authorization Policies for TERRA Environmental Twin
// Specifying Principal, Action, Resource, and Conditions

// 1. Any authenticated Citizen or Anonymous User can view public environmental sensor telemetry
permit(
    principal,
    action in [Action::"ReadTelemetry", Action::"ViewAeroHealth", Action::"BrowseCommunityFeed"],
    resource
);

// 2. Verified Citizens (Cognito group: 'CitizenScientist') can submit ground-truth pollution reports
permit(
    principal in Role::"CitizenScientist",
    action in [Action::"SubmitPollutionReport", Action::"UploadEvidenceS3", Action::"CreateCommunityPost"],
    resource is ResourceType::"EnvironmentalReport"
);

// 3. Municipal Environmental Inspectors (Cognito group: 'MunicipalAuthority') can verify reports & issue alerts
permit(
    principal in Role::"MunicipalAuthority",
    action in [Action::"VerifyReport", Action::"TriggerEventBridgeAlert", Action::"DispatchCleanupCrew"],
    resource is ResourceType::"EnvironmentalReport"
);

// 4. Prohibit unverified anonymous users from creating civic fund initiatives or triggering broadcast alerts
forbid(
    principal == Role::"AnonymousUser",
    action in [Action::"TriggerEventBridgeAlert", Action::"CreateFundraiser", Action::"DeleteReport"],
    resource
);
