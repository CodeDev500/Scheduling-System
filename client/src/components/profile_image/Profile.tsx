import { useEffect, useState } from "react";
import "./ProfileStyle.css";
import { FaCamera } from "react-icons/fa";
import axios from "../../api/axios";

interface ProfileProps {
  setValue: (field: string, value: unknown) => void;
  image: string;
}

const Profile: React.FC<ProfileProps> = ({ setValue, image }) => {
  const [profilePic, setProfilePic] = useState<string>(
    "https://t3.ftcdn.net/jpg/03/46/83/96/360_F_346839683_6nAPzbhpSkIpb8pmAwufkC7c5eD7wYws.jpg"
  );

  useEffect(() => {
    if (image) {
      setProfilePic(
        image.startsWith("http") ? image : `${axios.defaults.baseURL}${image}`
      );
    }
  }, [image]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setValue("image", file); // Updates parent form state
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setProfilePic(e.target.result as string); // Sets preview
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadButtonClick = () => {
    const input = document.getElementById("file-upload") as HTMLInputElement;
    input?.click();
  };

  return (
    <div className="row">
      <div className="small-12 medium-2 large-2 columns relative">
        <div className="circle">
          <img
            onClick={handleUploadButtonClick}
            className="profile-pic"
            src={profilePic}
            alt="Profile"
          />
        </div>
        <div className="p-image absolute">
          <FaCamera
            className="fa fa-camera upload-button z-10"
            onClick={handleUploadButtonClick}
          />
          <input
            id="file-upload"
            className="file-upload"
            type="file"
            accept="image/*"
            name="image"
            onChange={handleFileChange}
            style={{ display: "none" }}
          />
        </div>
      </div>
    </div>
  );
};

export default Profile;
