function About() {
  const features = [
    {
      title: 'React 19',
      description: 'Latest React with improved performance and new features',
      icon: '⚛️',
    },
    {
      title: 'Vite',
      description: 'Lightning-fast build tool and development server',
      icon: '⚡',
    },
    {
      title: 'Tailwind CSS',
      description: 'Utility-first CSS framework for rapid UI development',
      icon: '🎨',
    },
    {
      title: 'Redux Toolkit',
      description: 'Simplified state management with Redux',
      icon: '🔄',
    },
    {
      title: 'Formik + Yup',
      description: 'Powerful form handling with validation',
      icon: '📝',
    },
    {
      title: 'React Router',
      description: 'Client-side routing for single-page applications',
      icon: '🗺️',
    },
  ];

  return (
    <div className="space-y-8">
      <section className="text-center">
        <h1 className="text-5xl font-bold text-gray-800 mb-4">About This Project</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          A comprehensive React frontend template with all the essential tools and libraries
          you need to build modern web applications.
        </p>
      </section>

      <section className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
        {features.map((feature, index) => (
          <div
            key={index}
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <div className="text-4xl mb-3">{feature.icon}</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">{feature.title}</h3>
            <p className="text-gray-600">{feature.description}</p>
          </div>
        ))}
      </section>
    </div>
  );
}

export default About;
