// app/page.js or components/HeroSection.js
'use client';

import { motion } from 'framer-motion';
import { BriefcaseIcon, MapPinIcon, StarIcon, UsersIcon } from '@heroicons/react/24/solid';

const BamendaHeroSection = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  };

  const cardVariants = {
    hidden: { scale: 0.95, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        duration: 0.5,
        delay: 0.8,
      },
    },
  };

  const stats = [
    { icon: UsersIcon, value: '2,500+', label: 'Students Placed' },
    { icon: BriefcaseIcon, value: '85%', label: 'Job Success Rate' },
    { icon: MapPinIcon, value: '50+', label: 'Locations Covered' },
    { icon: StarIcon, value: '4.9', label: 'Average Rating' },
  ];

  const internships = [
    { title: 'Software Developer', location: 'Bamenda • Remote', active: true },
    { title: 'Digital Marketing', location: 'Bamenda • Remote', active: true },
    { title: 'Data Analyst', location: 'Bamenda • Remote', active: true },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <motion.div
        className="max-w-7xl w-full mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="text-center mb-8">
          <motion.div
            className="inline-block bg-orange-100 text-orange-600 text-sm font-semibold px-4 py-1 rounded-full mb-4"
            variants={itemVariants}
          >
            <span className="text-orange-400 mr-2">#1</span> Internship Platform in Bamenda
          </motion.div>
          <motion.h1 className="text-4xl md:text-6xl font-bold text-gray-800" variants={itemVariants}>
            Launch Your <span className="text-orange-500">Dream Career</span>
          </motion.h1>
          <motion.h1 className="text-4xl md:text-6xl font-bold text-gray-800 mt-2" variants={itemVariants}>
            in Bamenda
          </motion.h1>
          <motion.p className="text-gray-600 mt-4 max-w-2xl mx-auto" variants={itemVariants}>
            Connect with top companies, gain real experience, and build the professional network that will shape your future in Cameroon's Silicon Valley.
          </motion.p>
        </div>

        <div className="flex justify-center gap-4 mb-12">
          <motion.button
            className="bg-orange-500 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:bg-orange-600 transition-colors duration-300 flex items-center gap-2"
            variants={itemVariants}
          >
            Find Your Internship
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </motion.button>
          <motion.button
            className="bg-white text-gray-700 font-bold py-3 px-6 rounded-lg shadow-md hover:bg-gray-100 transition-colors duration-300 flex items-center gap-2"
            variants={itemVariants}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
            </svg>
            Watch Demo
          </motion.button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center mb-12">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              className="bg-white p-6 rounded-lg shadow-md"
              custom={index}
              variants={itemVariants}
            >
              <stat.icon className="h-8 w-8 text-orange-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
              <p className="text-gray-500">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        <motion.div className="bg-white p-6 rounded-lg shadow-xl max-w-3xl mx-auto" variants={cardVariants}>
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
            <p className="text-sm font-semibold text-gray-600">Bamenda Internships Dashboard</p>
          </div>

          <div className="flex justify-around items-end h-24 bg-gray-50 rounded-lg p-4 mb-6">
            {[...Array(7)].map((_, i) => (
              <motion.div
                key={i}
                className="w-4 bg-gradient-to-t from-orange-400 to-red-500 rounded-t-sm"
                initial={{ height: 0 }}
                animate={{ height: `${Math.random() * 80 + 20}%` }}
                transition={{ duration: 1, delay: 1 + i * 0.1, ease: "easeOut" }}
              ></motion.div>
            ))}
          </div>

          {internships.map((internship, index) => (
            <motion.div
              key={index}
              className="flex items-center justify-between p-4 mb-2 bg-white rounded-lg hover:bg-gray-50 transition-colors"
              custom={index}
              variants={itemVariants}
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-orange-500 rounded-full"></div>
                <div>
                  <p className="font-bold text-gray-800">{internship.title}</p>
                  <p className="text-sm text-gray-500">{internship.location}</p>
                </div>
              </div>
              {internship.active && <span className="text-green-500 font-semibold">Active</span>}
            </motion.div>
          ))}

          <div className="text-right mt-4">
            <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 font-semibold px-3 py-1 rounded-full text-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12 1.5a.5.5 0 01.5.5v10.586l2.293-2.293a.5.5 0 01.707.707l-3.5 3.5a.5.5 0 01-.707 0l-3.5-3.5a.5.5 0 11.707-.707L11.5 12.586V2a.5.5 0 01.5-.5z" clipRule="evenodd" />
                </svg>
              +35 New Jobs <span className="font-normal text-gray-500 ml-1">This week</span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default BamendaHeroSection;