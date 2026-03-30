import React, { createContext, useContext, useState, useEffect } from "react";

const AppContext = createContext();

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
};

export const AppProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem("darkMode");
    return saved ? JSON.parse(saved) : false;
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem("token") || null;
  });

  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });

  const [visitors, setVisitors] = useState([]);
  const [users, setUsers] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [availableTags, setAvailableTags] = useState([]);

  // Change this based on your environment
  const API_BASE = "https://paulaccesso.paulmerchants.net/api";

  // const API_BASE = "http://localhost:8598/api";

  // Dark mode effect
  useEffect(() => {
    localStorage.setItem("darkMode", JSON.stringify(darkMode));
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  // Fetch current user on refresh if token exists but user doesn't
  useEffect(() => {
    if (token && !user) {
      fetchCurrentUser();
    }
  }, [token]);

  // Fetch data when token or user role changes
  useEffect(() => {
    if (token && user) {
      fetchVisitors();
      fetchEmployees();
      if (user?.role === "ADMIN") {
        fetchUsers();
      }
    }
  }, [token, user?.role]);

  const fetchCurrentUser = async () => {
    try {
      const response = await fetch(`${API_BASE}/users/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));
      } else if (response.status === 401 || response.status === 403) {
        // Token expired or invalid
        logout();
      } else {
        const errorData = await response.json();
        addNotification({
          type: "error",
          message: errorData.message || "Failed to fetch user data",
        });
      }
    } catch (error) {
      console.error("Failed to fetch user:", error);
      addNotification({
        type: "error",
        message: "Network error. Please check your connection.",
      });
      logout();
    }
  };

  const fetchVisitors = async () => {
    try {
      const response = await fetch(`${API_BASE}/visitors`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setVisitors(data);
      } else if (response.status === 401) {
        logout();
      } else {
        const errorData = await response.json();
        console.error("Failed to fetch visitors:", errorData);
        addNotification({
          type: "error",
          message: errorData.message || "Failed to fetch visitors",
        });
      }
    } catch (error) {
      console.error("Failed to fetch visitors:", error);
      addNotification({
        type: "error",
        message: "Network error while fetching visitors",
      });
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await fetch(`${API_BASE}/users/employees`);
      if (response.ok) {
        const data = await response.json();
        setEmployees(data);
      } else {
        const errorData = await response.json();
        console.error("Failed to fetch employees:", errorData);
      }
    } catch (error) {
      console.error("Failed to fetch employees:", error);
    }
  };

  const fetchUsers = async () => {
    if (!token || user?.role !== "ADMIN") return;
    try {
      const response = await fetch(`${API_BASE}/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      } else if (response.status === 403) {
        addNotification({
          type: "error",
          message: "You don't have permission to view users",
        });
      } else {
        const errorData = await response.json();
        console.error("Failed to fetch users:", errorData);
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
    }
  };

  const sendOtp = async (email) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        addNotification({
          type: "success",
          message: data.message || "OTP sent successfully!",
        });
        return true;
      } else {
        // Handle different error scenarios
        let errorMessage = data.message || "Failed to send OTP";

        if (response.status === 400) {
          if (data.message === "User not found") {
            errorMessage = "User not found. Please check your email.";
          } else if (
            data.message ===
            "Access denied. Only admin and receptionist can login."
          ) {
            errorMessage =
              "Access denied. Only admin and receptionist can login.";
          } else {
            errorMessage = data.message || "Invalid request";
          }
        } else if (response.status === 500) {
          errorMessage = "Server error. Please try again later.";
        }

        addNotification({ type: "error", message: errorMessage });
        return false;
      }
    } catch (error) {
      console.error("Send OTP error:", error);
      addNotification({
        type: "error",
        message: "Network error. Please check your connection.",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (email, otp) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();

      if (response.ok) {
        setToken(data.accessToken);
        setUser(data.user);
        localStorage.setItem("token", data.accessToken);
        localStorage.setItem("user", JSON.stringify(data.user));
        addNotification({
          type: "success",
          message: "Login successful! Welcome back.",
        });
        return true;
      } else {
        let errorMessage = data.message || "Invalid OTP";

        if (response.status === 400) {
          if (data.message === "Invalid or expired OTP") {
            errorMessage = "Invalid or expired OTP. Please request a new one.";
          } else {
            errorMessage = data.message || "Invalid OTP";
          }
        }

        addNotification({ type: "error", message: errorMessage });
        return false;
      }
    } catch (error) {
      console.error("Verify OTP error:", error);
      addNotification({
        type: "error",
        message: "Network error. Please try again.",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const registerVisitor = async (visitorData) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/visitors`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(visitorData),
      });

      const data = await response.json();

      if (response.ok) {
        setVisitors([data, ...visitors]);
        addNotification({
          type: "success",
          message: `${data.name} registered successfully!`,
          description: `Notification sent to ${data.personToMeetDetails?.name || data.personToMeet}`,
        });
        return data;
      } else {
        let errorMessage = data.message || "Registration failed";

        if (response.status === 400) {
          if (data.message === "User not found") {
            errorMessage =
              "Employee not found. Please check the email address.";
          }
        }

        addNotification({ type: "error", message: errorMessage });
        return null;
      }
    } catch (error) {
      console.error("Register visitor error:", error);
      addNotification({
        type: "error",
        message: "Network error. Please check your connection.",
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const checkoutVisitor = async (id, checkoutPhoto = null) => {
    setLoading(true);
    try {
      const body = checkoutPhoto ? { checkoutPhoto } : {};
      const response = await fetch(`${API_BASE}/visitors/${id}/checkout`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (response.ok) {
        setVisitors(visitors.map((v) => (v.id === id ? data : v)));
        addNotification({
          type: "success",
          message: `${data.name} checked out successfully`,
        });
        return data;
      } else {
        addNotification({
          type: "error",
          message: data.message || "Checkout failed",
        });
        return null;
      }
    } catch (error) {
      console.error("Checkout error:", error);
      addNotification({
        type: "error",
        message: "Network error. Please try again.",
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const createUser = async (userData) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (response.ok) {
        setUsers([...users, data]);
        addNotification({
          type: "success",
          message: `User ${data.name} created successfully`,
        });
        return data;
      } else {
        let errorMessage = data.message || "Failed to create user";

        if (response.status === 400) {
          if (data.message === "Email already exists") {
            errorMessage =
              "Email already exists. Please use a different email.";
          }
        }

        addNotification({ type: "error", message: errorMessage });
        return null;
      }
    } catch (error) {
      console.error("Create user error:", error);
      addNotification({
        type: "error",
        message: "Network error. Please try again.",
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (id, userData) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/users/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (response.ok) {
        setUsers(users.map((u) => (u.id === id ? data : u)));
        addNotification({
          type: "success",
          message: `User ${data.name} updated successfully`,
        });
        return data;
      } else {
        addNotification({
          type: "error",
          message: data.message || "Failed to update user",
        });
        return null;
      }
    } catch (error) {
      console.error("Update user error:", error);
      addNotification({
        type: "error",
        message: "Network error. Please try again.",
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (id) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/users/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        setUsers(users.filter((u) => u.id !== id));
        addNotification({
          type: "success",
          message: "User deleted successfully",
        });
        return true;
      } else {
        const data = await response.json();
        addNotification({
          type: "error",
          message: data.message || "Failed to delete user",
        });
        return false;
      }
    } catch (error) {
      console.error("Delete user error:", error);
      addNotification({
        type: "error",
        message: "Network error. Please try again.",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const addNotification = (notification) => {
    const id = Date.now();
    setNotifications((prev) => [...prev, { id, ...notification }]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 5000);
  };

  const logout = () => {
    // Optional: Call logout endpoint if you have one
    if (token) {
      fetch(`${API_BASE}/auth/logout`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      }).catch(console.error);
    }

    setToken(null);
    setUser(null);
    setVisitors([]);
    setUsers([]);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    addNotification({ type: "info", message: "Logged out successfully" });
  };

  const toggleDarkMode = () => setDarkMode((prev) => !prev);

  const getStats = () => {
    const today = new Date().toDateString();
    const todayVisitors = visitors.filter(
      (v) => new Date(v.checkInTime).toDateString() === today,
    );
    const activeNow = todayVisitors.filter((v) => v.active).length;
    const checkedOut = todayVisitors.filter((v) => !v.active).length;
    const totalActive = visitors.filter((v) => v.active).length; // All active visitors

    return {
      totalToday: todayVisitors.length,
      activeNow,
      checkedOut,
      totalActive, // Optional
    };
  };

  // Function to fetch available tags
  const fetchAvailableTags = async () => {
    if (!token) return [];
    try {
      const response = await fetch(`${API_BASE}/tags/available`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setAvailableTags(data);
        return data;
      }
      return [];
    } catch (error) {
      console.error("Failed to fetch tags:", error);
      return [];
    }
  };

  // Function to assign tag to visitor
  const assignTagToVisitor = async (visitorId, tagNumber) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/tags/assign`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ visitorId, tagNumber }),
      });

      const data = await response.json();

      if (response.ok) {
        // Update visitors list
        setVisitors(visitors.map((v) => (v.id === visitorId ? data : v)));
        // Refresh available tags
        fetchAvailableTags();
        addNotification({
          type: "success",
          message: `Tag ${tagNumber} assigned to ${data.name}`,
        });
        return data;
      } else {
        addNotification({
          type: "error",
          message: data.message || "Failed to assign tag",
        });
        return null;
      }
    } catch (error) {
      console.error("Assign tag error:", error);
      addNotification({
        type: "error",
        message: "Network error. Please try again.",
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Function to get all tags (for admin)
  const getAllTags = async () => {
    if (!token) return [];
    try {
      const response = await fetch(`${API_BASE}/tags`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        return await response.json();
      }
      return [];
    } catch (error) {
      console.error("Failed to fetch all tags:", error);
      return [];
    }
  };

  return (
    <AppContext.Provider
      value={{
        darkMode,
        toggleDarkMode,
        token,
        user,
        visitors,
        users,
        employees,
        loading,
        API_BASE,
        sendOtp,
        verifyOtp,
        registerVisitor,
        checkoutVisitor,
        createUser,
        updateUser,
        deleteUser,
        logout,
        getStats,
        notifications,
        availableTags,
        fetchAvailableTags,
        assignTagToVisitor,
        getAllTags,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
