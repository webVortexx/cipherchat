import { createBrowserRouter,Navigate, Routes, Route, RouterProvider } from "react-router-dom";
import { Login,Signup,Chat } from "./pages";
import { isAuthenticated } from "./auth/auth";

function ProtectedRoute({ children }) {
  if (!isAuthenticated()) {
    return <Navigate to="/" replace />;
    //replace prevents the user to going back to dashboard using back arrow in browser
     // if repace true he cant go back replace = {true} is same as jute mentioning replace
  }
  return children;
}
function PublicOnlyRoute({ children }) {
  if (isAuthenticated()) {
    return <Navigate to="/chat" replace />;
  }
  return children;
}




// Adding the create Browser router for all routes
const router = createBrowserRouter(
  [
    { 
        path:"/",
        element:(<PublicOnlyRoute><Login /></PublicOnlyRoute>)
    },
    {
        path:"/signup",
        element:(<PublicOnlyRoute><Signup /></PublicOnlyRoute>)
    },
    {
        path:"/chat",
        element:(<ProtectedRoute><Chat /></ProtectedRoute>)
    },
    {
      path:"*",
      element:<Navigate to="/" replace />
    }
  ]
)


function App() {
  return (
        <RouterProvider router={router} />
  );
}

export default App;
