import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="pt-20">
        {/* Hero Section */}
        <section className="relative bg-black text-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl md:text-6xl font-black mb-6">ABOUT TOT INT</h1>
              <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto">
                A church family called to reveal God's glory and transform lives through His word and power.
              </p>
            </div>
          </div>
        </section>

        {/* Our Story */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-black mb-6">Our Story</h2>
                <p className="text-lg text-gray-700 mb-6">
                  TOT INT was founded with a vision to create a space where people can encounter the transformative power of God. 
                  We believe in building authentic community while pursuing spiritual growth and divine purpose.
                </p>
                <p className="text-lg text-gray-700 mb-6">
                  Our church family is committed to excellence in worship, teaching, and service. We strive to create 
                  an environment where everyone can discover their calling and live out their God-given destiny.
                </p>
              </div>
              <div className="bg-gray-100 h-96 rounded-lg flex items-center justify-center">
                <p className="text-gray-500">Church Photo</p>
              </div>
            </div>
          </div>
        </section>

        {/* Our Beliefs */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">What We Believe</h2>
              <p className="text-lg text-gray-700 max-w-3xl mx-auto">
                Our faith is built on the foundation of Scripture and the transformative power of Jesus Christ.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <h3 className="text-xl font-bold text-black mb-4">The Word of God</h3>
                <p className="text-gray-700">
                  We believe the Bible is the inspired, infallible Word of God and our ultimate authority for faith and life.
                </p>
              </div>
              <div className="text-center">
                <h3 className="text-xl font-bold text-black mb-4">Salvation by Grace</h3>
                <p className="text-gray-700">
                  We believe salvation comes through faith in Jesus Christ alone, not by works, but by God's grace.
                </p>
              </div>
              <div className="text-center">
                <h3 className="text-xl font-bold text-black mb-4">The Power of the Spirit</h3>
                <p className="text-gray-700">
                  We believe in the gifts and power of the Holy Spirit working in and through believers today.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Leadership */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">Our Leadership</h2>
              <p className="text-lg text-gray-700 max-w-3xl mx-auto">
                God has called gifted leaders to guide and shepherd our church family.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-gray-100 h-64 w-64 mx-auto rounded-lg mb-4 flex items-center justify-center">
                  <p className="text-gray-500">Pastor Photo</p>
                </div>
                <h3 className="text-xl font-bold text-black mb-2">Lead Pastor</h3>
                <p className="text-gray-700">Senior Pastor & Founder</p>
              </div>
              <div className="text-center">
                <div className="bg-gray-100 h-64 w-64 mx-auto rounded-lg mb-4 flex items-center justify-center">
                  <p className="text-gray-500">Pastor Photo</p>
                </div>
                <h3 className="text-xl font-bold text-black mb-2">Associate Pastor</h3>
                <p className="text-gray-700">Teaching & Discipleship</p>
              </div>
              <div className="text-center">
                <div className="bg-gray-100 h-64 w-64 mx-auto rounded-lg mb-4 flex items-center justify-center">
                  <p className="text-gray-500">Pastor Photo</p>
                </div>
                <h3 className="text-xl font-bold text-black mb-2">Worship Pastor</h3>
                <p className="text-gray-700">Music & Creative Arts</p>
              </div>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
};

export default About;