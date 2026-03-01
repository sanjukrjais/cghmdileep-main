import { useState } from "react";
import { auth, database } from "../components/firebaseConfig";
import { ref, remove } from "firebase/database";
import { deleteUser } from "firebase/auth";
import { useNavigate } from "react-router-dom";

const DeleteAccount = () => {

  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [reason, setReason] = useState("");
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDeleteAccount = async () => {

    const user = auth.currentUser;

    if (!user) {
      alert("User not logged in");
      return;
    }

    if (email !== user.email) {
      alert("Email does not match");
      return;
    }

    if (!agree) {
      alert("Please agree before deleting");
      return;
    }

    const confirmDelete = window.confirm(
      "Are you sure you want to delete your account permanently?"
    );

    if (!confirmDelete) return;

    try {

      setLoading(true);

      // Delete user data
      await remove(ref(database, `users/${user.uid}`));

      // Delete authentication account
      await deleteUser(user);

      alert("Account deleted successfully");

      navigate("/login");

    } catch (error) {

      console.error(error);

      alert("Error deleting account");

    } finally {
      setLoading(false);
    }
  };

  return (

    <div className="min-h-screen flex justify-center items-center bg-red-50">

      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md space-y-5">

        <h2 className="text-2xl font-bold text-center text-red-600">
          Delete Account
        </h2>

        <p className="text-gray-600 text-sm text-center">
          This action will permanently delete your account and data.
        </p>

        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e)=>setEmail(e.target.value)}
          className="w-full border p-3 rounded-lg"
        />

        <textarea
          placeholder="Reason for deleting account"
          value={reason}
          onChange={(e)=>setReason(e.target.value)}
          className="w-full border p-3 rounded-lg"
        />

        <div className="flex gap-2 items-center">

          <input
            type="checkbox"
            checked={agree}
            onChange={()=>setAgree(!agree)}
          />

          <p className="text-sm">
            I agree to delete my account permanently
          </p>

        </div>

        <button
          onClick={handleDeleteAccount}
          disabled={loading}
          className="w-full bg-red-500 text-white p-3 rounded-lg hover:bg-red-700"
        >

          {loading ? "Deleting..." : "Delete My Account"}

        </button>

        <button
          onClick={()=>navigate("/profile")}
          className="w-full bg-gray-300 p-3 rounded-lg"
        >
          Cancel
        </button>

      </div>

    </div>
  );
};

export default DeleteAccount;