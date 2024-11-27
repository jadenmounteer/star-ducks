// We can add more properties to the user object as shown here: https://firebase.google.com/docs/reference/js/v8/firebase.User
export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}
