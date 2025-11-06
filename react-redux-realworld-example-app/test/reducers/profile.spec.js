const { test, expect } = require('@playwright/test');
const profileReducer = require('../../src/reducers/profile').default;
const {
  PROFILE_PAGE_LOADED,
  PROFILE_PAGE_UNLOADED,
  FOLLOW_USER,
  UNFOLLOW_USER,
} = require('../../src/constants/actionTypes');

test.describe("profile reducer", () => {
  test("should return initial state", () => {
    expect(profileReducer(undefined, {})).toEqual({});
  });

  test.describe("PROFILE_PAGE_LOADED action", () => {
    test("should load profile data", () => {
      const profile = {
        username: "testuser",
        bio: "Test bio",
        image: "https://example.com/avatar.jpg",
        following: false,
      };
      const action = {
        type: PROFILE_PAGE_LOADED,
        payload: [{ profile }, { articles: [], articlesCount: 0 }],
      };
      const result = profileReducer({}, action);
      expect(result).toEqual(profile);
    });

    test("should load profile with following status", () => {
      const profile = {
        username: "johndoe",
        bio: "Developer",
        image: "https://example.com/john.jpg",
        following: true,
      };
      const action = {
        type: PROFILE_PAGE_LOADED,
        payload: [{ profile }, { articles: [], articlesCount: 0 }],
      };
      const result = profileReducer({}, action);
      expect(result.following).toBe(true);
    });

    test("should replace existing profile", () => {
      const currentProfile = {
        username: "olduser",
        bio: "Old bio",
      };
      const newProfile = {
        username: "newuser",
        bio: "New bio",
      };
      const action = {
        type: PROFILE_PAGE_LOADED,
        payload: [{ profile: newProfile }, { articles: [], articlesCount: 0 }],
      };
      const result = profileReducer(currentProfile, action);
      expect(result).toEqual(newProfile);
      expect(result.username).toBe("newuser");
    });
  });

  test.describe("PROFILE_PAGE_UNLOADED action", () => {
    test("should reset state when profile page unloaded", () => {
      const currentState = {
        username: "testuser",
        bio: "Test bio",
        image: "https://example.com/avatar.jpg",
        following: false,
      };
      const result = profileReducer(currentState, {
        type: PROFILE_PAGE_UNLOADED,
      });
      expect(result).toEqual({});
    });
  });

  test.describe("FOLLOW_USER action", () => {
    test("should update profile to following", () => {
      const currentState = {
        username: "testuser",
        bio: "Test bio",
        following: false,
      };
      const updatedProfile = {
        username: "testuser",
        bio: "Test bio",
        following: true,
      };
      const action = {
        type: FOLLOW_USER,
        payload: { profile: updatedProfile },
      };
      const result = profileReducer(currentState, action);
      expect(result).toEqual(updatedProfile);
      expect(result.following).toBe(true);
    });

    test("should replace entire profile on follow", () => {
      const action = {
        type: FOLLOW_USER,
        payload: {
          profile: {
            username: "followeduser",
            bio: "Followed user bio",
            image: "https://example.com/avatar.jpg",
            following: true,
          },
        },
      };
      const result = profileReducer({}, action);
      expect(result.following).toBe(true);
      expect(result.username).toBe("followeduser");
    });
  });

  test.describe("UNFOLLOW_USER action", () => {
    test("should update profile to not following", () => {
      const currentState = {
        username: "testuser",
        bio: "Test bio",
        following: true,
      };
      const updatedProfile = {
        username: "testuser",
        bio: "Test bio",
        following: false,
      };
      const action = {
        type: UNFOLLOW_USER,
        payload: { profile: updatedProfile },
      };
      const result = profileReducer(currentState, action);
      expect(result).toEqual(updatedProfile);
      expect(result.following).toBe(false);
    });

    test("should replace entire profile on unfollow", () => {
      const action = {
        type: UNFOLLOW_USER,
        payload: {
          profile: {
            username: "unfolloweduser",
            bio: "Unfollowed user bio",
            image: "https://example.com/avatar.jpg",
            following: false,
          },
        },
      };
      const result = profileReducer({}, action);
      expect(result.following).toBe(false);
      expect(result.username).toBe("unfolloweduser");
    });
  });

  test.describe("state immutability", () => {
    test("should not mutate original state on FOLLOW_USER", () => {
      const originalState = {
        username: "testuser",
        bio: "Test bio",
        following: false,
      };
      const action = {
        type: FOLLOW_USER,
        payload: {
          profile: {
            username: "testuser",
            bio: "Test bio",
            following: true,
          },
        },
      };
      profileReducer(originalState, action);
      expect(originalState.following).toBe(false);
    });
  });

  test.describe("unknown action", () => {
    test("should return current state for unknown action", () => {
      const currentState = {
        username: "testuser",
        bio: "Test bio",
      };
      const action = { type: "UNKNOWN_ACTION" };
      const result = profileReducer(currentState, action);
      expect(result).toEqual(currentState);
    });
  });
});
