import React from "react";
import {
  IoRocketOutline,
  IoEyeOutline,
  IoTrophyOutline,
  IoCheckmarkCircle,
} from "react-icons/io5";
import { FaChartLine, FaClock, FaUsers, FaBrain } from "react-icons/fa";
import adviser from "../../assets/PICTURES AND ROLES/Thesis Adviser.jpg";
import projectManager from "../../assets/PICTURES AND ROLES/Project Manager.jpg";
import systemDeveloper from "../../assets/PICTURES AND ROLES/System Developer.jpg";
import trainingHead from "../../assets/PICTURES AND ROLES/Training Head.jpg";
import tester from "../../assets/PICTURES AND ROLES/Tester.jpg";

const About = () => {
  const features = [
    {
      icon: <FaClock className="text-4xl" />,
      title: "Time Optimization",
      description: "Intelligent algorithms that maximize resource utilization and minimize scheduling conflicts",
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: <FaBrain className="text-4xl" />,
      title: "Smart Allocation",
      description: "AI-powered faculty and room assignment based on specialization and availability",
      color: "from-purple-500 to-purple-600"
    },
    {
      icon: <FaChartLine className="text-4xl" />,
      title: "Real-time Analytics",
      description: "Comprehensive insights and reports for better decision-making",
      color: "from-pink-500 to-pink-600"
    },
    {
      icon: <FaUsers className="text-4xl" />,
      title: "Collaborative Platform",
      description: "Seamless coordination between administrators, faculty, and departments",
      color: "from-green-500 to-green-600"
    }
  ];

  const team = [
    {
      name: "Darllaine Lincopinis",
      role: "Thesis Adviser",
      image: adviser,
      description: "Guiding and mentoring the development team throughout the thesis project, providing expert advice and ensuring academic excellence"
    },
    {
      name: "Daisy Ann Magbato",
      role: "Project Manager",
      image: projectManager,
      color: "from-purple-500 to-purple-600",
      description: "Leading the project team, coordinating tasks, managing timelines, and ensuring successful delivery of OptiSched"
    },
    {
      name: "Axl Heart Remegio",
      role: "System Developer",
      image: systemDeveloper,
      color: "from-green-500 to-green-600",
      description: "Designing and developing the core system architecture, implementing features, and ensuring robust functionality"
    },
    {
      name: "Meralyn Largo",
      role: "Training Head",
      image: trainingHead,
      color: "from-pink-500 to-pink-600",
      description: "Developing training materials, conducting user training sessions, and ensuring smooth system adoption"
    },
    {
      name: "Charity Soriño",
      role: "Tester",
      image: tester,
      color: "from-red-500 to-red-600",
      description: "Ensuring software quality through comprehensive testing, identifying bugs, and validating system functionality"
    }
  ];

  const values = [
    {
      title: "Innovation",
      description: "Continuously improving our scheduling algorithms to meet evolving educational needs"
    },
    {
      title: "Efficiency",
      description: "Streamlining academic operations to save time and resources"
    },
    {
      title: "Accuracy",
      description: "Ensuring precise scheduling with minimal conflicts and maximum optimization"
    },
    {
      title: "Collaboration",
      description: "Fostering teamwork between all stakeholders in the scheduling process"
    }
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute top-20 right-10 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-10 left-1/2 w-72 h-72 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>
        
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 animate-fade-in">
            About OptiSched
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 max-w-4xl mx-auto leading-relaxed">
            Revolutionizing academic scheduling through intelligent automation and optimization
          </p>
        </div>
      </div>

      {/* Mission & Vision Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {/* Mission */}
          <div className="bg-white rounded-2xl p-8 md:p-10 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-t-4 border-blue-500">
            <div className="flex items-center mb-6">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 w-16 h-16 rounded-full flex items-center justify-center mr-4">
                <IoRocketOutline className="text-3xl text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900">Our Mission</h2>
            </div>
            <p className="text-gray-700 leading-relaxed text-lg">
              To empower educational institutions with cutting-edge scheduling technology that optimizes 
              resource allocation, reduces conflicts, and enhances the overall academic experience for 
              students, faculty, and administrators.
            </p>
          </div>

          {/* Vision */}
          <div className="bg-white rounded-2xl p-8 md:p-10 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-t-4 border-purple-500">
            <div className="flex items-center mb-6">
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 w-16 h-16 rounded-full flex items-center justify-center mr-4">
                <IoEyeOutline className="text-3xl text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900">Our Vision</h2>
            </div>
            <p className="text-gray-700 leading-relaxed text-lg">
              To become the leading academic scheduling solution in the Philippines, recognized for 
              innovation, reliability, and exceptional user experience, while continuously adapting to 
              the evolving needs of modern education.
            </p>
          </div>
        </div>

        {/* Development Team Section */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Meet Our Team</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              The talented individuals behind OptiSched's development and success
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden"
              >
                <div className="relative mb-6">
                  <div className={`absolute inset-0 bg-gradient-to-br ${member.color} opacity-10 rounded-t-2xl`}></div>
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-64 object-contain rounded-xl shadow-lg"
                  />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">{member.name}</h3>
                <p className="text-sm font-semibold text-blue-600 mb-4 text-center">{member.role}</p>
                <p className="text-gray-600 leading-relaxed text-sm text-center">{member.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Features Section */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Key Features</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover what makes OptiSched the ultimate scheduling solution
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
              >
                <div className={`bg-gradient-to-br ${feature.color} w-16 h-16 rounded-full flex items-center justify-center mb-6 text-white`}>
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Core Values */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-4">
              <IoTrophyOutline className="text-5xl text-purple-600 mr-4" />
              <h2 className="text-4xl font-bold text-gray-900">Our Core Values</h2>
            </div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              The principles that guide everything we do
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border-l-4 border-purple-500"
              >
                <div className="flex items-center mb-3">
                  <IoCheckmarkCircle className="text-2xl text-purple-600 mr-2" />
                  <h3 className="text-xl font-bold text-gray-900">{value.title}</h3>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Story Section */}
        <div className="bg-white rounded-2xl p-8 md:p-12 shadow-xl">
          <h2 className="text-4xl font-bold text-gray-900 mb-8 text-center">Our Story</h2>
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-700 leading-relaxed mb-6 text-lg">
              OptiSched was born from a simple observation: academic scheduling is complex, time-consuming, 
              and often frustrating for everyone involved. At WMSU Pagadian Campus, we witnessed firsthand 
              the challenges faced by administrators trying to create optimal schedules while juggling 
              countless constraints and requirements.
            </p>
            <p className="text-gray-700 leading-relaxed mb-6 text-lg">
              Our team of dedicated developers and educators came together with a vision to transform this 
              process. We combined cutting-edge technology with deep understanding of academic operations 
              to create a solution that doesn't just automate scheduling—it optimizes it.
            </p>
            <p className="text-gray-700 leading-relaxed mb-6 text-lg">
              Today, OptiSched serves multiple departments and programs, helping to create conflict-free 
              schedules that maximize resource utilization while respecting faculty preferences and 
              institutional constraints. Our journey continues as we constantly innovate and improve, 
              driven by feedback from our users and the evolving needs of modern education.
            </p>
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 text-center shadow-2xl">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Optimize Your Scheduling?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join us in revolutionizing academic scheduling. Experience the power of intelligent automation.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/contact-us"
              className="bg-white text-purple-600 font-bold py-4 px-8 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              Contact Us
            </a>
            <a
              href="/home"
              className="bg-transparent border-2 border-white text-white font-bold py-4 px-8 rounded-lg hover:bg-white hover:text-purple-600 transition-all duration-300 transform hover:scale-105"
            >
              Get Started
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
