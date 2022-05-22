import SecureLS from "secure-ls";

const ls = new SecureLS({ encodingType: "aes" });

const initialState = {
  user: ls.get("_4144444552555f55534552") || null,
};

/**
 * Redux Reducer. Used to configure and interact with the Redux store
 * @param {Object} state redux state
 * @param {Objcet} action action
 */
export const reducer = (state = initialState, action) => {
  switch (action.type) {
    case "SET_USER": {
      if (action.payload) ls.set("_4144444552555f55534552", action.payload);
      return { user: action.payload };
    }
    case "LOGOUT": {
      ls.remove("74");
      ls.remove("_4144444552555f55534552");
      return initialState;
    }
    default: {
      return state;
    }
  }
};

/**
 * Maps the Redux state to the props of the component {user}
 * @param {Object} state redux state
 */
export const mapStateToProps = (state) => ({ user: state.user });
