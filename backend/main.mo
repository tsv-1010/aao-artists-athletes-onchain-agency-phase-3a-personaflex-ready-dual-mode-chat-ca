import List "mo:core/List";
import Map "mo:core/Map";
import Iter "mo:core/Iter";
import Order "mo:core/Order";
import Time "mo:core/Time";
import Array "mo:core/Array";
import Runtime "mo:core/Runtime";

import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import Storage "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";

actor {
  var accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  // User Types
  public type UserRole = {
    #artist;
    #athlete;
    #brand;
  };

  public type SocialLinks = {
    twitter : ?Text;
    instagram : ?Text;
    linkedin : ?Text;
    website : ?Text;
  };

  public type Profile = {
    name : Text;
    profession : Text;
    bio : Text;
    social : SocialLinks;
    role : UserRole;
  };

  public type Consent = {
    dataUsage : Bool;
    matchingPermission : Bool;
    ownershipHash : Text;
    timestamp : Int;
  };

  public type SoulboundToken = {
    principal : Principal;
    role : UserRole;
    verified : Bool;
    metadata : Text;
    timestamp : Int;
  };

  public type UserRecord = {
    profile : Profile;
    consents : List.List<Consent>;
    sbt : SoulboundToken;
    createdAt : Int;
  };

  public type UserRecordView = {
    profile : Profile;
    consents : [Consent];
    sbt : SoulboundToken;
    createdAt : Int;
  };

  // Chat Onboarding Types
  public type Message = {
    role : Text;
    content : Text;
    timestamp : Int;
  };

  public type ChatSession = {
    sessionId : Text;
    user : Principal;
    userRole : UserRole;
    messages : List.List<Message>;
    startTime : Int;
    endTime : ?Int;
    consentRef : Text;
    status : Text;
    metadata : Text;
    inferenceResponse : ?Text;
    inferenceStatus : Text;
  };

  public type ChatSessionView = {
    sessionId : Text;
    user : Principal;
    userRole : UserRole;
    messages : [Message];
    startTime : Int;
    endTime : ?Int;
    consentRef : Text;
    status : Text;
    metadata : Text;
    inferenceResponse : ?Text;
    inferenceStatus : Text;
  };

  // UserRecord comparator for sorting
  module UserRecord {
    public func compare(a : UserRecord, b : UserRecord) : Order.Order {
      Int.compare(a.createdAt, b.createdAt);
    };
  };

  // ChatSession comparator for sorting
  module ChatSession {
    public func compare(a : ChatSession, b : ChatSession) : Order.Order {
      Int.compare(a.startTime, b.startTime);
    };
  };

  let userRecords = Map.empty<Principal, UserRecord>();
  let chatSessions = Map.empty<Text, ChatSession>();

  // <user-profile-access>
  public type UserProfile = Profile;

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    switch (userRecords.get(caller)) {
      case (null) { null };
      case (?record) { ?record.profile };
    };
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    switch (userRecords.get(user)) {
      case (null) { null };
      case (?record) { ?record.profile };
    };
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };

    switch (userRecords.get(caller)) {
      case (null) {
        createNewProfile(caller, profile);
      };
      case (?record) { updateExistingProfile(caller, profile, record) };
    };
  };
  // </user-profile-access>

  // <profile-management>
  public shared ({ caller }) func createProfile(profile : Profile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create profiles");
    };

    if (userRecords.containsKey(caller)) {
      Runtime.trap("Profile already exists");
    };

    createNewProfile(caller, profile);
  };

  public query ({ caller }) func getProfile() : async ?Profile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    switch (userRecords.get(caller)) {
      case (null) { null };
      case (?record) { ?record.profile };
    };
  };

  public shared ({ caller }) func updateProfile(profile : Profile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update profiles");
    };

    switch (userRecords.get(caller)) {
      case (null) { Runtime.trap("Profile does not exist") };
      case (?record) { updateExistingProfile(caller, profile, record) };
    };
  };

  // Profile helper functions
  func createNewProfile(caller : Principal, profile : Profile) {
    let sbt : SoulboundToken = {
      principal = caller;
      role = profile.role;
      verified = false;
      metadata = "";
      timestamp = Time.now();
    };

    let initialConsent : Consent = {
      dataUsage = true;
      matchingPermission = false;
      ownershipHash = "";
      timestamp = Time.now();
    };

    let consentsList = List.empty<Consent>();
    consentsList.add(initialConsent);

    let userRecord : UserRecord = {
      profile;
      consents = consentsList;
      sbt;
      createdAt = Time.now();
    };

    userRecords.add(caller, userRecord);
  };

  func updateExistingProfile(caller : Principal, profile : Profile, record : UserRecord) {
    let updatedRecord : UserRecord = {
      profile;
      consents = record.consents;
      sbt = record.sbt;
      createdAt = record.createdAt;
    };
    userRecords.add(caller, updatedRecord);
  };
  // </profile-management>

  // <consent-management>
  public shared ({ caller }) func addConsent(dataUsage : Bool, matchingPermission : Bool, ownershipHash : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add consents");
    };

    switch (userRecords.get(caller)) {
      case (null) { Runtime.trap("Profile does not exist") };
      case (?record) {
        let newConsent : Consent = {
          dataUsage;
          matchingPermission;
          ownershipHash;
          timestamp = Time.now();
        };

        record.consents.add(newConsent);

        let updatedRecord : UserRecord = {
          profile = record.profile;
          consents = record.consents;
          sbt = record.sbt;
          createdAt = record.createdAt;
        };

        userRecords.add(caller, updatedRecord);
      };
    };
  };

  public query ({ caller }) func getConsents() : async [Consent] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access consents");
    };

    switch (userRecords.get(caller)) {
      case (null) { Runtime.trap("Profile does not exist") };
      case (?record) {
        record.consents.toArray();
      };
    };
  };
  // </consent-management>

  // <soulbound-token-management>
  public query ({ caller }) func getSBT() : async ?SoulboundToken {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access SBT");
    };

    switch (userRecords.get(caller)) {
      case (null) { null };
      case (?record) { ?record.sbt };
    };
  };

  public shared ({ caller }) func verifySBT(user : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can verify SBTs");
    };

    switch (userRecords.get(user)) {
      case (null) { Runtime.trap("Profile does not exist") };
      case (?record) {
        let updatedSBT : SoulboundToken = {
          principal = record.sbt.principal;
          role = record.sbt.role;
          verified = true;
          metadata = record.sbt.metadata;
          timestamp = record.sbt.timestamp;
        };

        let updatedRecord : UserRecord = {
          profile = record.profile;
          consents = record.consents;
          sbt = updatedSBT;
          createdAt = record.createdAt;
        };

        userRecords.add(user, updatedRecord);
      };
    };
  };
  // </soulbound-token-management>

  // <brand-functionality>
  public shared ({ caller }) func createBrandBrief() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create briefs");
    };

    switch (userRecords.get(caller)) {
      case (null) { Runtime.trap("Profile does not exist") };
      case (?record) {
        if (record.profile.role != #brand) {
          Runtime.trap("Only brands can create briefs");
        };
        Runtime.trap("Brand brief creation not yet implemented");
      };
    };
  };
  // </brand-functionality>

  // <chat-session-management>
  public shared ({ caller }) func createChatSession(sessionId : Text, consentRef : Text, metadata : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create chat sessions");
    };

    switch (userRecords.get(caller)) {
      case (null) { Runtime.trap("Profile does not exist") };
      case (?record) {
        if (chatSessions.containsKey(sessionId)) {
          Runtime.trap("Chat session already exists");
        };

        let newSession : ChatSession = {
          sessionId;
          user = caller;
          userRole = record.profile.role;
          messages = List.empty<Message>();
          startTime = Time.now();
          endTime = null;
          consentRef;
          status = "active";
          metadata;
          inferenceResponse = null;
          inferenceStatus = "none";
        };

        chatSessions.add(sessionId, newSession);
      };
    };
  };

  public shared ({ caller }) func addMessageToSession(sessionId : Text, role : Text, content : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add messages");
    };

    switch (chatSessions.get(sessionId)) {
      case (null) { Runtime.trap("Chat session does not exist") };
      case (?session) {
        if (session.user != caller) {
          Runtime.trap("Unauthorized: Can only add messages to your own sessions");
        };

        let newMessage : Message = {
          role;
          content;
          timestamp = Time.now();
        };

        session.messages.add(newMessage);

        let updatedSession : ChatSession = {
          sessionId = session.sessionId;
          user = session.user;
          userRole = session.userRole;
          messages = session.messages;
          startTime = session.startTime;
          endTime = session.endTime;
          consentRef = session.consentRef;
          status = session.status;
          metadata = session.metadata;
          inferenceResponse = session.inferenceResponse;
          inferenceStatus = session.inferenceStatus;
        };

        chatSessions.add(sessionId, updatedSession);
      };
    };
  };

  public shared ({ caller }) func updateSessionInference(sessionId : Text, inferenceResponse : Text, inferenceStatus : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update inference");
    };

    switch (chatSessions.get(sessionId)) {
      case (null) { Runtime.trap("Chat session does not exist") };
      case (?session) {
        if (session.user != caller) {
          Runtime.trap("Unauthorized: Can only update your own sessions");
        };

        let updatedSession : ChatSession = {
          sessionId = session.sessionId;
          user = session.user;
          userRole = session.userRole;
          messages = session.messages;
          startTime = session.startTime;
          endTime = session.endTime;
          consentRef = session.consentRef;
          status = session.status;
          metadata = session.metadata;
          inferenceResponse = ?inferenceResponse;
          inferenceStatus;
        };

        chatSessions.add(sessionId, updatedSession);
      };
    };
  };

  public shared ({ caller }) func endChatSession(sessionId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can end sessions");
    };

    switch (chatSessions.get(sessionId)) {
      case (null) { Runtime.trap("Chat session does not exist") };
      case (?session) {
        if (session.user != caller) {
          Runtime.trap("Unauthorized: Can only end your own sessions");
        };

        let updatedSession : ChatSession = {
          sessionId = session.sessionId;
          user = session.user;
          userRole = session.userRole;
          messages = session.messages;
          startTime = session.startTime;
          endTime = ?Time.now();
          consentRef = session.consentRef;
          status = "completed";
          metadata = session.metadata;
          inferenceResponse = session.inferenceResponse;
          inferenceStatus = session.inferenceStatus;
        };

        chatSessions.add(sessionId, updatedSession);
      };
    };
  };

  public query ({ caller }) func getChatSession(sessionId : Text) : async ?ChatSessionView {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access chat sessions");
    };

    switch (chatSessions.get(sessionId)) {
      case (null) { null };
      case (?session) {
        if (session.user != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only view your own sessions");
        };

        ?{
          sessionId = session.sessionId;
          user = session.user;
          userRole = session.userRole;
          messages = session.messages.toArray();
          startTime = session.startTime;
          endTime = session.endTime;
          consentRef = session.consentRef;
          status = session.status;
          metadata = session.metadata;
          inferenceResponse = session.inferenceResponse;
          inferenceStatus = session.inferenceStatus;
        };
      };
    };
  };

  public query ({ caller }) func getUserChatSessions() : async [ChatSessionView] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access chat sessions");
    };

    let allSessions = chatSessions.values().toArray();
    let userSessions = allSessions.filter(func(session) { session.user == caller });

    userSessions.map(
      func(session) {
        {
          sessionId = session.sessionId;
          user = session.user;
          userRole = session.userRole;
          messages = session.messages.toArray();
          startTime = session.startTime;
          endTime = session.endTime;
          consentRef = session.consentRef;
          status = session.status;
          metadata = session.metadata;
          inferenceResponse = session.inferenceResponse;
          inferenceStatus = session.inferenceStatus;
        };
      }
    );
  };

  public query ({ caller }) func getAllChatSessions() : async [ChatSessionView] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all chat sessions");
    };

    let allSessions = chatSessions.values().toArray();

    allSessions.map(
      func(session) {
        {
          sessionId = session.sessionId;
          user = session.user;
          userRole = session.userRole;
          messages = session.messages.toArray();
          startTime = session.startTime;
          endTime = session.endTime;
          consentRef = session.consentRef;
          status = session.status;
          metadata = session.metadata;
          inferenceResponse = session.inferenceResponse;
          inferenceStatus = session.inferenceStatus;
        };
      }
    );
  };
  // </chat-session-management>

  // <admin-functions>
  public shared ({ caller }) func verifyUser(user : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can verify users");
    };

    switch (userRecords.get(user)) {
      case (null) { Runtime.trap("User does not exist") };
      case (?record) {
        let updatedSBT : SoulboundToken = {
          principal = record.sbt.principal;
          role = record.sbt.role;
          verified = true;
          metadata = record.sbt.metadata;
          timestamp = record.sbt.timestamp;
        };

        let updatedRecord : UserRecord = {
          profile = record.profile;
          consents = record.consents;
          sbt = updatedSBT;
          createdAt = record.createdAt;
        };

        userRecords.add(user, updatedRecord);
      };
    };
  };
  // </admin-functions>

  // <helper-functions>
  public query ({ caller }) func getAllUserRecords() : async [UserRecordView] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all user records");
    };

    let records = userRecords.values().toArray();
    let recordViews = records.map(
      func(record) {
        {
          profile = record.profile;
          consents = record.consents.toArray();
          sbt = record.sbt;
          createdAt = record.createdAt;
        };
      }
    );

    recordViews;
  };
  // </helper-functions>
};
