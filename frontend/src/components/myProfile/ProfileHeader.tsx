import React from "react";
import {
  User as UserIcon,
  Mail,
  Phone,
  Camera,
  MapPin,
  Calendar,
  CheckCircle,
  Edit3,
} from "lucide-react";
interface OverviewProps {
  userData: any;
}
const ProfileHeader = ({ userData }: OverviewProps) => {
  return (
    <div className="bg-white rounded-lg shadow-sm mb-8">
      <div className="relative">
        {/* Cover Background */}
        <div className="h-32 bg-gradient-to-r from-green-600 to-blue-600 rounded-t-lg"></div>

        {/* Profile Info */}
        <div className="relative px-6 pb-6">
          <div className="flex flex-col md:flex-row md:items-end md:space-x-6">
            {/* Profile Picture */}
            <div className="relative -mt-16 mb-4 md:mb-0">
              <div className="w-32 h-32 bg-white rounded-full border-2 border-white shadow-lg flex items-center justify-center">
                {userData.profile.profilePicture ? (
                  <img
                    src={userData.profile.profilePicture}
                    alt="Profile"
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <UserIcon className="w-16 h-16 text-gray-400" />
                )}
              </div>
              <button className="absolute bottom-2 right-2 w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white hover:bg-green-700 transition-colors">
                <Camera className="w-4 h-4" />
              </button>
            </div>

            {/* User Details */}
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-1">
                    {userData.profile.name}
                  </h1>
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                    <div className="flex items-center">
                      <Mail className="w-4 h-4 mr-1" />
                      {userData.profile.email}
                    </div>
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 mr-1" />
                      {userData.profile.phone}
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      {userData.profile.address}
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      Joined {userData.profile.joinDate.date}
                    </div>
                  </div>
                </div>

                <div className="mt-4 md:mt-0 flex items-center space-x-3">
                  <div className="flex items-center px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    KYC {userData.profile.kycStatus}
                  </div>
                  <button className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                    <Edit3 className="w-4 h-4 mr-2" />
                    Edit Profile
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
