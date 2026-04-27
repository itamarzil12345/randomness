# State Management

The frontend uses Redux Toolkit because the assignment requires a state management tool and Redux Toolkit provides clear async flows with low boilerplate.

## State Shape

```text
people
  randomPeople
  savedPeople
  loading
    random
    saved
    mutation
  error
```

## Async Actions

- `fetchRandomPeople`: loads 10 profiles from `randomuser.me`.
- `fetchSavedPeople`: loads saved profiles from the backend.
- `savePerson`: persists a random profile to the backend.
- `updateSavedPerson`: updates a saved profile name in the backend.
- `deleteSavedPerson`: deletes a saved profile from the backend.

## Local UI State

Filters are kept in page-local React state because they only affect the current list view:

- name filter
- country filter

Editable profile name state is also local to the profile page until the user clicks `Update`.

## Saved Profiles on Random List

The random list merges saved profiles before unsaved random profiles:

```text
savedPeople + randomPeople excluding duplicate saved ids
```

This makes previously saved profiles visible first while preserving the random API results below them.
