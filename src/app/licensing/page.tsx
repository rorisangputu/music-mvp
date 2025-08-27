import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Music,
    FileText,
    CreditCard,
    Shield,
    Clock,
    Globe,
    ArrowRight,
    CheckCircle,
    PlayCircle,
    Mail,
    Phone,
    Download,
    Star,
    Zap,
    AlertTriangle,
    Info,
    DollarSign
} from 'lucide-react';

export default function MusicLicensingInfo() {
    const licensingSteps = [
        {
            step: 1,
            title: "Choose Your Music",
            description: "Browse our production music library and select the tracks you need for your project.",
            details: ["Listen to full tracks", "Download high-quality files", "Filter by genre, mood, or duration"],
            icon: <Music className="w-6 h-6" />
        },
        {
            step: 2,
            title: "Note Track Details",
            description: "Keep record of essential information for each track you use.",
            details: ["Track title and composer", "Catalogue/CD number", "Track duration", "Library name"],
            icon: <FileText className="w-6 h-6" />
        },
        {
            step: 3,
            title: "Complete Cue Sheet",
            description: "Fill out a detailed cue sheet listing all tracks used in your production.",
            details: ["Production details", "Usage duration per track", "Broadcast/distribution plans"],
            icon: <CheckCircle className="w-6 h-6" />
        },
        {
            step: 4,
            title: "Submit & Pay",
            description: "Submit your cue sheet to receive an invoice with the appropriate licensing fees.",
            details: ["Quick processing", "Multiple payment options", "Instant license delivery"],
            icon: <CreditCard className="w-6 h-6" />
        }
    ];

    const licenseTypes = [
        {
            category: "Online Advertising",
            description: "For digital marketing campaigns and social media content",
            icon: <Globe className="w-6 h-6" />,
            examples: ["Social media ads", "YouTube pre-rolls", "Website content", "Email campaigns"],
            color: "from-blue-500 to-cyan-500",
            bgColor: "bg-blue-50/50"
        },
        {
            category: "Corporate Communications",
            description: "Internal training videos and corporate presentations",
            icon: <FileText className="w-6 h-6" />,
            examples: ["Training videos", "Internal presentations", "Company meetings", "Staff communications"],
            color: "from-green-500 to-emerald-500",
            bgColor: "bg-green-50/50"
        },
        {
            category: "Film & TV",
            description: "Professional broadcast and streaming content",
            icon: <PlayCircle className="w-6 h-6" />,
            examples: ["TV shows", "Films", "Documentaries", "Streaming series"],
            color: "from-purple-500 to-pink-500",
            bgColor: "bg-purple-50/50"
        },
        {
            category: "Gaming & Apps",
            description: "Interactive media and mobile applications",
            icon: <Zap className="w-6 h-6" />,
            examples: ["Mobile games", "Apps", "Interactive content", "Software"],
            color: "from-orange-500 to-red-500",
            bgColor: "bg-orange-50/50"
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50/30 relative overflow-hidden">
            {/* Enhanced animated background elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -left-40 w-96 h-96 bg-gradient-to-br from-orange-300/20 to-pink-300/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute top-20 right-10 w-80 h-80 bg-gradient-to-br from-blue-300/15 to-purple-300/15 rounded-full blur-3xl animate-pulse delay-1000"></div>
                <div className="absolute bottom-20 left-20 w-72 h-72 bg-gradient-to-br from-green-300/20 to-teal-300/20 rounded-full blur-3xl animate-pulse delay-2000"></div>
                <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-gradient-to-br from-purple-300/15 to-orange-300/15 rounded-full blur-3xl animate-pulse delay-500"></div>

                {/* Floating musical notes */}
                <div className="absolute top-1/4 left-1/4 animate-bounce delay-300">
                    <Music className="w-8 h-8 text-orange-300/30" />
                </div>
                <div className="absolute top-3/4 right-1/3 animate-bounce delay-700">
                    <Music className="w-6 h-6 text-blue-300/30" />
                </div>
                <div className="absolute top-1/2 right-1/4 animate-bounce delay-1000">
                    <PlayCircle className="w-10 h-10 text-purple-300/30" />
                </div>
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Enhanced Header */}
                <div className="text-center py-16 md:py-24">
                    <div className="inline-flex items-center gap-3 mb-8 px-4 py-2 bg-white/60 backdrop-blur-xl rounded-full border border-orange-200/50 shadow-lg">
                        <div className="p-2 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full">
                            <Shield className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-orange-700 font-semibold">Professional Music Licensing</span>
                    </div>

                    <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-slate-800 via-slate-700 to-orange-700 bg-clip-text text-transparent mb-8 leading-tight">
                        Music Licensing<br />
                        <span className="text-orange-600">Made Simple</span>
                    </h1>

                    <p className="text-xl md:text-2xl text-slate-600 max-w-4xl mx-auto leading-relaxed mb-12">
                        High-quality production music for all your creative projects. Pre-cleared tracks with quick,
                        easy licensing through our streamlined process.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button className="group bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-8 py-4 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                            Get Started Today
                            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                        </Button>
                        <Button variant="outline" className="border-2 border-orange-500 text-orange-600 hover:bg-orange-50 px-8 py-4 rounded-xl">
                            Browse Music Library
                        </Button>
                    </div>
                </div>

                {/* Enhanced Key Benefits */}
                <div className="grid md:grid-cols-3 gap-8 mb-20">
                    {[
                        {
                            icon: <Clock className="w-8 h-8" />,
                            title: "Quick Processing",
                            description: "Fast turnaround on license approvals and invoicing - typically within 24 hours",
                            color: "from-blue-500 to-cyan-500"
                        },
                        {
                            icon: <Shield className="w-8 h-8" />,
                            title: "Pre-Cleared Music",
                            description: "All tracks are pre-cleared for commercial use with full copyright protection",
                            color: "from-green-500 to-emerald-500"
                        },
                        {
                            icon: <Globe className="w-8 h-8" />,
                            title: "Global Licensing",
                            description: "Flexible territorial options from local to worldwide distribution rights",
                            color: "from-purple-500 to-pink-500"
                        }
                    ].map((benefit, index) => (
                        <Card key={index} className="group bg-white/70 backdrop-blur-xl border border-white/60 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-105">
                            <CardHeader className="text-center pb-4">
                                <div className={`w-20 h-20 bg-gradient-to-r ${benefit.color} rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg transform group-hover:rotate-6 transition-transform duration-300`}>
                                    <div className="text-white">
                                        {benefit.icon}
                                    </div>
                                </div>
                                <CardTitle className="text-slate-800 text-2xl font-bold group-hover:text-orange-700 transition-colors">
                                    {benefit.title}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-slate-600 text-center leading-relaxed">
                                    {benefit.description}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Enhanced Licensing Process */}
                <div className="mb-20">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-6">
                            How to License Music
                        </h2>
                        <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                            Follow our simple 4-step process to get the music you need for your project
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {licensingSteps.map((step, index) => (
                            <Card key={index} className="group bg-white/70 backdrop-blur-xl border border-white/60 shadow-xl relative overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
                                {/* Step number badge */}
                                <div className="absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center shadow-lg border-4 border-white">
                                    <span className="text-white font-bold text-xl">{step.step}</span>
                                </div>

                                {/* Progress connector line */}
                                {index < licensingSteps.length - 1 && (
                                    <div className="hidden lg:block absolute top-8 -right-8 w-16 h-0.5 bg-gradient-to-r from-orange-300 to-orange-400 z-0"></div>
                                )}

                                <CardHeader className="pb-4 pt-8">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="p-3 bg-orange-100/80 rounded-xl group-hover:bg-orange-200/80 transition-colors">
                                            <div className="text-orange-600">
                                                {step.icon}
                                            </div>
                                        </div>
                                        <CardTitle className="text-slate-800 text-xl font-bold group-hover:text-orange-700 transition-colors">
                                            {step.title}
                                        </CardTitle>
                                    </div>
                                    <CardDescription className="text-slate-600 text-base leading-relaxed">
                                        {step.description}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-3">
                                        {step.details.map((detail, idx) => (
                                            <li key={idx} className="text-sm text-slate-600 flex items-start gap-3">
                                                <CheckCircle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                                                <span>{detail}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Enhanced License Categories */}
                <div className="mb-20">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-6">
                            License Categories
                        </h2>
                        <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                            Choose the right license type for your project needs
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        {licenseTypes.map((type, index) => (
                            <Card key={index} className={`group bg-white/70 backdrop-blur-xl border border-white/60 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1 ${type.bgColor}`}>
                                <CardHeader>
                                    <div className="flex items-center space-x-4 mb-4">
                                        <div className={`p-4 bg-gradient-to-r ${type.color} rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                            <div className="text-white">
                                                {type.icon}
                                            </div>
                                        </div>
                                        <div>
                                            <CardTitle className="text-slate-800 text-2xl font-bold group-hover:text-orange-700 transition-colors">
                                                {type.category}
                                            </CardTitle>
                                            <CardDescription className="text-slate-600 text-lg mt-2">
                                                {type.description}
                                            </CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex flex-wrap gap-3">
                                        {type.examples.map((example, idx) => (
                                            <Badge key={idx} className="bg-white/80 text-slate-700 border border-slate-200 hover:bg-orange-100 hover:border-orange-300 hover:text-orange-700 transition-all duration-200 px-3 py-1 text-sm font-medium">
                                                {example}
                                            </Badge>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Enhanced Important Notes */}
                <div className="space-y-6 mb-20">
                    <div className="text-center mb-12">
                        <h3 className="text-3xl font-bold text-slate-800 mb-4">Important Information</h3>
                        <p className="text-lg text-slate-600">Key points to remember when licensing music</p>
                    </div>

                    <Alert className="bg-gradient-to-r from-yellow-50/90 to-orange-50/90 border-2 border-yellow-300/60 backdrop-blur-xl shadow-xl">
                        <AlertTriangle className="h-5 w-5 text-yellow-600" />
                        <AlertDescription className="text-slate-700 text-lg">
                            <strong className="text-yellow-700 font-semibold">License Required:</strong> A production music cue sheet must be submitted before your production is broadcast, transmitted, distributed, or exhibited. Failure to obtain proper licensing is a copyright infringement.
                        </AlertDescription>
                    </Alert>

                    <Alert className="bg-gradient-to-r from-blue-50/90 to-cyan-50/90 border-2 border-blue-300/60 backdrop-blur-xl shadow-xl">
                        <Info className="h-5 w-5 text-blue-600" />
                        <AlertDescription className="text-slate-700 text-lg">
                            <strong className="text-blue-700 font-semibold">Cue Sheet Details:</strong> Ensure your cue sheet includes track titles, catalogue numbers, composer information, library names, and exact track durations. Accurate information is essential for proper licensing.
                        </AlertDescription>
                    </Alert>

                    <Alert className="bg-gradient-to-r from-orange-50/90 to-red-50/90 border-2 border-orange-300/60 backdrop-blur-xl shadow-xl">
                        <DollarSign className="h-5 w-5 text-orange-600" />
                        <AlertDescription className="text-slate-700 text-lg">
                            <strong className="text-orange-700 font-semibold">Flexible Pricing:</strong> Rates vary by usage type, duration, and territory. Volume discounts available for productions using more than 10 tracks per year. Contact us for special rates and custom packages.
                        </AlertDescription>
                    </Alert>
                </div>

                {/* Enhanced Contact CTA */}
                <div className="text-center">
                    <Card className="bg-gradient-to-r from-white/80 to-orange-50/80 border-2 border-orange-200/60 backdrop-blur-xl shadow-2xl inline-block hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-2">
                        <CardContent className="pt-12 pb-12 md:px-16">
                            <div className="mb-8">
                                <div className="w-20 h-20 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
                                    <Music className="w-10 h-10 text-white" />
                                </div>
                                <h3 className="text-4xl font-bold text-slate-800 mb-4">
                                    Ready to License Music?
                                </h3>
                                <p className="text-slate-600 mb-8 text-xl max-w-2xl mx-auto leading-relaxed">
                                    Get started with our extensive production music library today and bring your creative vision to life
                                </p>
                            </div>

                            <div className="space-y-6">
                                <p className="text-orange-600 font-bold text-xl">Contact our licensing team:</p>
                                <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                                    <div className="flex items-center gap-4 p-4 bg-white/60 rounded-xl border border-orange-200/50">
                                        <div className="p-3 bg-orange-100 rounded-xl">
                                            <Mail className="w-6 h-6 text-orange-600" />
                                        </div>
                                        <div className="text-left">
                                            <p className="text-sm text-slate-600 font-medium">Email us</p>
                                            <p className="text-orange-600 hover:text-orange-700 cursor-pointer transition-colors font-semibold text-lg">
                                                info@cmmg.co.za
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 p-4 bg-white/60 rounded-xl border border-orange-200/50">
                                        <div className="p-3 bg-orange-100 rounded-xl">
                                            <Phone className="w-6 h-6 text-orange-600" />
                                        </div>
                                        <div className="text-left">
                                            <p className="text-sm text-slate-600 font-medium">Call us</p>
                                            <p className="text-orange-600 font-semibold text-lg">
                                                +27 11 447 8870
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4">
                                    <Button className="group bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-8 py-4 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 text-lg">
                                        Start Licensing Now
                                        <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}