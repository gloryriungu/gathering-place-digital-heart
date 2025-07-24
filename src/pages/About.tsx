
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
              <h1 className="text-4xl md:text-6xl font-black mb-6">ABOUT TOT INTERNATIONAL</h1>
              <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto">
                A ministry committed to raising champions for Christ through sound biblical teaching, authentic worship, and transformational encounters with God.
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
                  TOT International was founded with a divine vision to raise champions for Christ who will transform nations through the power of God's Word. We believe every believer is called to be a champion in their sphere of influence.
                </p>
                <p className="text-lg text-gray-700 mb-6">
                  Under the leadership of Pastor Timothy Kitui, our ministry has grown from a small fellowship to a thriving church family committed to excellence in worship, teaching, and service. We are passionate about seeing lives transformed and destinies fulfilled.
                </p>
                <p className="text-lg text-gray-700 mb-6">
                  Our mission extends beyond the four walls of our church as we plant churches, train leaders, and impact communities across East Africa and beyond.
                </p>
              </div>
              <div className="bg-gray-100 h-96 rounded-lg flex items-center justify-center">
                <p className="text-gray-500">Church Ministry Photo</p>
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
                Our faith is anchored on the unchanging Word of God and the transformative power of Jesus Christ.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <h3 className="text-xl font-bold text-black mb-4">The Authority of Scripture</h3>
                <p className="text-gray-700">
                  We believe the Bible is the inspired, infallible, and authoritative Word of God, our final guide for faith and Christian living.
                </p>
              </div>
              <div className="text-center">
                <h3 className="text-xl font-bold text-black mb-4">Salvation by Grace</h3>
                <p className="text-gray-700">
                  We believe salvation is a gift from God through faith in Jesus Christ, not by works, but by His grace and mercy.
                </p>
              </div>
              <div className="text-center">
                <h3 className="text-xl font-bold text-black mb-4">The Power of the Holy Spirit</h3>
                <p className="text-gray-700">
                  We believe in the baptism of the Holy Spirit and the operation of spiritual gifts for the edification of the church today.
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
                God has raised up anointed leaders to guide and shepherd our church family with wisdom, love, and biblical truth.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-gray-100 h-64 w-64 mx-auto rounded-lg mb-4 flex items-center justify-center">
                  <p className="text-gray-500">Pastor Timothy Kitui</p>
                </div>
                <h3 className="text-xl font-bold text-black mb-2">Pastor Timothy Kitui</h3>
                <p className="text-gray-700">Senior Pastor & Founder</p>
              </div>
              <div className="text-center">
                <div className="bg-gray-100 h-64 w-64 mx-auto rounded-lg mb-4 flex items-center justify-center">
                  <p className="text-gray-500">Associate Pastor</p>
                </div>
                <h3 className="text-xl font-bold text-black mb-2">Associate Pastor</h3>
                <p className="text-gray-700">Teaching & Discipleship</p>
              </div>
              <div className="text-center">
                <div className="bg-gray-100 h-64 w-64 mx-auto rounded-lg mb-4 flex items-center justify-center">
                  <p className="text-gray-500">Worship Pastor</p>
                </div>
                <h3 className="text-xl font-bold text-black mb-2">Worship Pastor</h3>
                <p className="text-gray-700">Music & Creative Arts</p>
              </div>
            </div>
          </div>
        </section>

        {/* Vision & Mission */}
        <section className="py-20 bg-black text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-12">
              <div className="text-center">
                <h2 className="text-3xl md:text-4xl font-bold mb-6">OUR VISION</h2>
                <p className="text-lg text-gray-300 leading-relaxed">
                  To raise champions for Christ who will transform nations through the power of God's Word and the demonstration of His love.
                </p>
              </div>
              <div className="text-center">
                <h2 className="text-3xl md:text-4xl font-bold mb-6">OUR MISSION</h2>
                <p className="text-lg text-gray-300 leading-relaxed">
                  To provide sound biblical teaching, authentic worship, and transformational encounters with God that equip believers for victorious living and effective ministry.
                </p>
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
