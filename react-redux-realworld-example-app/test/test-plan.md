# Unit Test Plan for React Redux RealWorld Example App

## Test Coverage Goal: >80%

## Overview

This document outlines the comprehensive unit testing strategy for the React Redux RealWorld example application to achieve test coverage exceeding 80%.

## Testing Framework & Tools

### Required Dependencies

```json
{
  "devDependencies": {
    "@testing-library/react": "^13.4.0",
    "@testing-library/jest-dom": "^5.16.5",
    "@testing-library/user-event": "^14.4.3",
    "redux-mock-store": "^1.5.4",
    "jest": "^29.0.0",
    "jest-environment-jsdom": "^29.0.0"
  }
}
```

### Configuration

- **Test Runner**: Jest
- **React Testing Library**: For component testing
- **Redux Mock Store**: For testing Redux actions and reducers
- **Coverage Tool**: Jest's built-in coverage reporter

---

## Test Structure

### 1. Redux Layer Testing (Priority: HIGH)

#### 1.1 Reducers (`src/reducers/`)

Each reducer should have comprehensive tests covering:

**article.js**

- [ ] Initial state
- [ ] ARTICLE_PAGE_LOADED action
- [ ] ARTICLE_PAGE_UNLOADED action
- [ ] ADD_COMMENT action
- [ ] DELETE_COMMENT action
- [ ] State immutability

**articleList.js**

- [ ] Initial state
- [ ] SET_PAGE action
- [ ] APPLY_TAG_FILTER action
- [ ] HOME_PAGE_LOADED action
- [ ] HOME_PAGE_UNLOADED action
- [ ] CHANGE_TAB action
- [ ] PROFILE_PAGE_LOADED action
- [ ] PROFILE_FAVORITES_PAGE_LOADED action

**auth.js**

- [ ] Initial state
- [ ] LOGIN/REGISTER actions
- [ ] LOGOUT action
- [ ] ASYNC_START/ASYNC_END states
- [ ] Error handling
- [ ] Token storage

**common.js**

- [ ] APP_LOAD action
- [ ] REDIRECT action
- [ ] ASYNC operations handling

**editor.js**

- [ ] Article creation flow
- [ ] Article update flow
- [ ] ADD_TAG/REMOVE_TAG actions
- [ ] UPDATE_FIELD_EDITOR action
- [ ] Form state management

**home.js**

- [ ] Initial state
- [ ] HOME_PAGE_LOADED action
- [ ] Tag filter application

**profile.js**

- [ ] PROFILE_PAGE_LOADED action
- [ ] FOLLOW_USER/UNFOLLOW_USER actions
- [ ] Profile state updates

**settings.js**

- [ ] SETTINGS_SAVED action
- [ ] SETTINGS_PAGE_UNLOADED action
- [ ] LOGOUT action

**Expected Coverage**: 90%+ for all reducers

---

### 2. Component Testing (Priority: HIGH)

#### 2.1 Core Components

**App.js**

- [ ] Renders without crashing
- [ ] Router configuration
- [ ] Header component rendering
- [ ] Route matching and navigation
- [ ] Redux store connection
- [ ] Token handling on mount

**Header.js**

- [ ] Renders logged-out state correctly
- [ ] Renders logged-in state with user info
- [ ] Navigation links present
- [ ] Active route highlighting
- [ ] User dropdown functionality

**Home/index.js**

- [ ] Banner display for non-authenticated users
- [ ] Main feed rendering
- [ ] Tag list rendering
- [ ] Tab switching (Global/Personal feed)
- [ ] Pagination functionality

**Home/Banner.js**

- [ ] Displays application name
- [ ] Shows tagline
- [ ] Renders only when not logged in

**Home/MainView.js**

- [ ] Renders article list
- [ ] Tab switching logic
- [ ] Feed type selection
- [ ] Tag filtering

**Home/Tags.js**

- [ ] Displays popular tags
- [ ] Tag click handler
- [ ] Loading state
- [ ] Empty state

#### 2.2 Article Components

**ArticleList.js**

- [ ] Renders list of articles
- [ ] Empty state handling
- [ ] Loading state
- [ ] Pagination component integration

**ArticlePreview.js**

- [ ] Displays article metadata (author, date)
- [ ] Shows favorite count
- [ ] Favorite button click handler
- [ ] Navigation to article detail
- [ ] Tag list rendering

**Article/index.js**

- [ ] Article content rendering
- [ ] Comment section rendering
- [ ] Author info display
- [ ] Article actions visibility (edit/delete for owner)

**Article/ArticleMeta.js**

- [ ] Author information display
- [ ] Follow/unfollow button
- [ ] Favorite/unfavorite button
- [ ] Edit/delete buttons for article owner
- [ ] Date formatting

**Article/ArticleActions.js**

- [ ] Edit button navigation
- [ ] Delete confirmation flow
- [ ] Owner-only visibility

**Article/CommentContainer.js**

- [ ] Comment list rendering
- [ ] Comment input for authenticated users
- [ ] Login prompt for unauthenticated users

**Article/CommentList.js**

- [ ] Renders all comments
- [ ] Empty state
- [ ] Delete button for comment owner

**Article/Comment.js**

- [ ] Comment body display
- [ ] Author info and avatar
- [ ] Delete button visibility logic
- [ ] Date formatting

**Article/CommentInput.js**

- [ ] Textarea input handling
- [ ] Form submission
- [ ] Loading state during submission
- [ ] Error handling

**Article/DeleteButton.js**

- [ ] Click handler
- [ ] Conditional rendering based on ownership

#### 2.3 Form Components

**Editor.js**

- [ ] Form field rendering (title, description, body, tags)
- [ ] Field value updates
- [ ] Tag addition/removal
- [ ] Form submission
- [ ] Validation errors display
- [ ] Create vs Edit mode
- [ ] Navigation after successful submission

**Login.js**

- [ ] Email and password fields
- [ ] Form submission
- [ ] Error display
- [ ] Link to register page
- [ ] Redux action dispatch

**Register.js**

- [ ] Username, email, and password fields
- [ ] Form submission
- [ ] Error display
- [ ] Link to login page
- [ ] Redux action dispatch

**Settings.js**

- [ ] Profile fields rendering
- [ ] Field updates
- [ ] Update profile submission
- [ ] Logout button
- [ ] Error handling

#### 2.4 Profile Components

**Profile.js**

- [ ] User info display (avatar, bio, username)
- [ ] Follow/unfollow button
- [ ] Tab switching (My Articles/Favorited)
- [ ] Articles list rendering
- [ ] Edit profile button for current user

**ProfileFavorites.js**

- [ ] Favorited articles rendering
- [ ] Integration with article list
- [ ] Pagination

#### 2.5 Utility Components

**ListErrors.js**

- [ ] Error list rendering
- [ ] Multiple errors display
- [ ] Conditional rendering (only when errors exist)

**ListPagination.js**

- [ ] Page numbers rendering
- [ ] Active page highlighting
- [ ] Page click handler
- [ ] Edge cases (first/last page)

**Expected Coverage**: 85%+ for all components

---

### 3. Middleware Testing (Priority: MEDIUM)

**middleware.js**

- [ ] Local storage token persistence
- [ ] API error handling
- [ ] Request/response interceptors
- [ ] Action flow modification

**Expected Coverage**: 80%+

---

### 4. API Agent Testing (Priority: MEDIUM)

**agent.js**

- [ ] API endpoint methods
- [ ] Token header injection
- [ ] Request/response handling
- [ ] Error scenarios
- [ ] Mock superagent requests

**Expected Coverage**: 75%+

---

### 5. Store and Configuration Testing (Priority: LOW)

**store.js**

- [ ] Store creation
- [ ] Middleware application
- [ ] Initial state

**reducer.js**

- [ ] Root reducer combination
- [ ] State shape

**Expected Coverage**: 70%+

---

## Testing Patterns & Best Practices

### Component Testing Pattern

```javascript
import { render, screen, fireEvent } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";

describe("ComponentName", () => {
  const mockStore = configureStore();
  let store;

  beforeEach(() => {
    store = mockStore(initialState);
  });

  it("should render correctly", () => {
    render(
      <Provider store={store}>
        <ComponentName />
      </Provider>
    );
    // Assertions
  });
});
```

### Reducer Testing Pattern

```javascript
import reducer from "./reducerName";

describe("reducerName", () => {
  it("should return initial state", () => {
    expect(reducer(undefined, {})).toEqual(initialState);
  });

  it("should handle ACTION_TYPE", () => {
    const action = { type: "ACTION_TYPE", payload: data };
    expect(reducer(initialState, action)).toEqual(expectedState);
  });
});
```

### Async Action Testing

```javascript
import configureMockStore from "redux-mock-store";
import thunk from "redux-thunk";

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe("async actions", () => {
  it("should dispatch expected actions", async () => {
    const store = mockStore({});
    await store.dispatch(asyncAction());
    const actions = store.getActions();
    expect(actions).toEqual(expectedActions);
  });
});
```

---

## Coverage Targets by Category

| Category     | Target Coverage | Priority     |
| ------------ | --------------- | ------------ |
| Reducers     | 90%+            | HIGH         |
| Components   | 85%+            | HIGH         |
| Middleware   | 80%+            | MEDIUM       |
| API Agent    | 75%+            | MEDIUM       |
| Store/Config | 70%+            | LOW          |
| **Overall**  | **>80%**        | **REQUIRED** |

---

## Test Execution Strategy

### Phase 1: Foundation (Week 1)

1. Set up testing infrastructure
2. Configure Jest and testing libraries
3. Create test utilities and helpers
4. Write tests for all reducers

### Phase 2: Core Components (Week 2)

1. Test App.js and routing
2. Test Header and navigation
3. Test Home page components
4. Test Article components

### Phase 3: Forms and Interactions (Week 3)

1. Test Editor component
2. Test Login/Register forms
3. Test Settings page
4. Test Profile components

### Phase 4: Integration and Polish (Week 4)

1. Test middleware and API layer
2. Integration tests for critical flows
3. Increase coverage for missed areas
4. Generate coverage reports

---

## Running Tests

### Commands

```bash
# Run all tests
npm test

# Run tests with coverage
npm test -- --coverage

# Run tests in watch mode
npm test -- --watch

# Run specific test file
npm test -- ComponentName.test.js
```

### Coverage Report

```bash
# Generate HTML coverage report
npm test -- --coverage --coverageReporters=html

# View coverage report
open coverage/index.html
```

---

## Success Criteria

✅ Overall test coverage > 80%
✅ All reducers have > 90% coverage
✅ All major components have > 85% coverage
✅ All tests pass consistently
✅ No skipped or pending tests
✅ Coverage report generated successfully

---

## Maintenance

- Run tests before every commit
- Update tests when adding new features
- Review coverage reports weekly
- Refactor tests to reduce duplication
- Keep test dependencies up to date

---

## Notes

- Focus on testing behavior, not implementation details
- Use data-testid attributes sparingly
- Mock external dependencies (API calls, localStorage)
- Test user interactions, not internal state
- Ensure tests are deterministic and isolated
- Keep tests readable and maintainable

---

_Last Updated: November 6, 2025_
