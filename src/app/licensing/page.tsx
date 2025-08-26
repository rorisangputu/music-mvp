import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Music, FileText, CreditCard, Shield, Clock, Globe } from 'lucide-react';

export default function MusicLicensingInfo() {
    const licensingSteps = [
        {
            step: 1,
            title: "Choose Your Music",
            description: "Browse our production music library and select the tracks you need for your project.",
            details: ["Listen to full tracks", "Download high-quality files", "Filter by genre, mood, or duration"]
        },
        {
            step: 2,
            title: "Note Track Details",
            description: "Keep record of essential information for each track you use.",
            details: ["Track title and composer", "Catalogue/CD number", "Track duration", "Library name"]
        },
        {
            step: 3,
            title: "Complete Cue Sheet",
            description: "Fill out a detailed cue sheet listing all tracks used in your production.",
            details: ["Production details", "Usage duration per track", "Broadcast/distribution plans"]
        },
        {
            step: 4,
            title: "Submit & Pay",
            description: "Submit your cue sheet to receive an invoice with the appropriate licensing fees.",
            details: ["Quick processing", "Multiple payment options", "Instant license delivery"]
        }
    ];

    const licenseTypes = [
        {
            category: "Online Advertising",
            description: "For digital marketing campaigns and social media content",
            icon: <Globe className="w-6 h-6" />,
            examples: ["Social media ads", "YouTube pre-rolls", "Website content", "Email campaigns"]
        },
        {
            category: "Corporate Communications",
            description: "Internal training videos and corporate presentations",
            icon: <FileText className="w-6 h-6" />,
            examples: ["Training videos", "Internal presentations", "Company meetings", "Staff communications"]
        },
        {
            category: "Film & TV",
            description: "Professional broadcast and streaming content",
            icon: <Music className="w-6 h-6" />,
            examples: ["TV shows", "Films", "Documentaries", "Streaming series"]
        },
        {
            category: "Gaming & Apps",
            description: "Interactive media and mobile applications",
            icon: <Shield className="w-6 h-6" />,
            examples: ["Mobile games", "Apps", "Interactive content", "Software"]
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300">
            <div className="container mx-auto px-4 py-12">
                {/* Header */}
                <div className="text-center py-20">
                    <h1 className="text-5xl font-bold bg-gradient-to-r from-orange-500 to-orange-400 bg-clip-text text-transparent mb-4">
                        Music Licensing Made Simple
                    </h1>
                    <p className="text-xl text-neutral-500 max-w-3xl mx-auto leading-relaxed">
                        High-quality production music for all your creative projects. Pre-cleared tracks with quick,
                        easy licensing through our streamlined process.
                    </p>
                </div>

                {/* Key Benefits */}
                <div className="grid md:grid-cols-3 gap-6 mb-16">
                    <Card className="bg-gray-900/50 border-gray-700 backdrop-blur-sm">
                        <CardHeader className="text-center">
                            <Clock className="w-12 h-12 text-orange-500 mx-auto mb-2" />
                            <CardTitle className="text-white">Quick Processing</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-neutral-200 text-center">Fast turnaround on license approvals and invoicing</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-gray-900/50 border-gray-700 backdrop-blur-sm">
                        <CardHeader className="text-center">
                            <Shield className="w-12 h-12 text-orange-500 mx-auto mb-2" />
                            <CardTitle className="text-white">Pre-Cleared Music</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-neutral-200 text-center">All tracks are pre-cleared for commercial use</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-gray-900/50 border-gray-700 backdrop-blur-sm">
                        <CardHeader className="text-center">
                            <Globe className="w-12 h-12 text-orange-500 mx-auto mb-2" />
                            <CardTitle className="text-white">Global Licensing</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-neutral-200 text-center">Flexible territorial options from local to worldwide</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Licensing Process */}
                <div className="mb-16">
                    <h2 className="text-3xl font-bold text-neutral-700 text-center mb-12">How to License Music</h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {licensingSteps.map((step, index) => (
                            <Card key={index} className="bg-gray-900/50 border-gray-700 backdrop-blur-sm relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-orange-600 to-orange-500 rounded-bl-3xl flex items-center justify-center">
                                    <span className="text-white font-bold text-lg">{step.step}</span>
                                </div>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-white text-lg pr-16">{step.title}</CardTitle>
                                    <CardDescription className="text-neutral-200">{step.description}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-1">
                                        {step.details.map((detail, idx) => (
                                            <li key={idx} className="text-sm text-neutral-200 flex items-center">
                                                <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mr-2"></div>
                                                {detail}
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* License Categories */}
                <div className="mb-16">
                    <h2 className="text-3xl font-bold text-neutral-700 text-center mb-12">License Categories</h2>
                    <div className="grid md:grid-cols-2 gap-6">
                        {licenseTypes.map((type, index) => (
                            <Card key={index} className="bg-gray-900/50 border-gray-800 backdrop-blur-sm hover:bg-gray-900/70 transition-all duration-300">
                                <CardHeader>
                                    <div className="flex items-center space-x-3 mb-2">
                                        <div className="p-2 bg-orange-600/20 rounded-lg text-orange-500">
                                            {type.icon}
                                        </div>
                                        <CardTitle className="text-white">{type.category}</CardTitle>
                                    </div>
                                    <CardDescription className="text-neutral-200">{type.description}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex flex-wrap gap-2">
                                        {type.examples.map((example, idx) => (
                                            <Badge key={idx} variant="secondary" className="bg-orange-600/20 text-orange-300 border-orange-600/30">
                                                {example}
                                            </Badge>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Important Notes */}
                <div className="space-y-6">
                    <Alert className="bg-yellow-500/10 border-yellow-500/30">
                        <Shield className="h-4 w-4 text-yellow-400" />
                        <AlertDescription className="text-neutral-600">
                            <strong className="text-yellow-600">License Required:</strong> A production music cue sheet must be submitted before your production is broadcast, transmitted, distributed, or exhibited. Failure to obtain proper licensing is a copyright infringement.
                        </AlertDescription>
                    </Alert>

                    <Alert className="bg-blue-500/10 border-blue-500/30">
                        <FileText className="h-4 w-4 text-blue-400" />
                        <AlertDescription className="text-neutral-600">
                            <strong className="text-blue-600">Cue Sheet Details:</strong> Ensure your cue sheet includes track titles, catalogue numbers, composer information, library names, and exact track durations. Accurate information is essential for proper licensing.
                        </AlertDescription>
                    </Alert>

                    <Alert className="bg-orange-600/10 border-orange-600/30">
                        <CreditCard className="h-4 w-4 text-orange-500" />
                        <AlertDescription className="text-neutral-600">
                            <strong className="text-orange-600">Flexible Pricing:</strong> Rates vary by usage type, duration, and territory. Volume discounts available for productions using more than 10 tracks per year. Contact us for special rates and custom packages.
                        </AlertDescription>
                    </Alert>
                </div>

                {/* Contact CTA */}
                <div className="text-center  mt-16">
                    <Card className="bg-gradient-to-r from-orange-600/20 to-orange-500/20 border-orange-600/30 backdrop-blur-sm inline-block">
                        <CardContent className="pt-6">
                            <h3 className="text-2xl font-bold text-white mb-4">Ready to License Music?</h3>
                            <p className="text-neutral-600 mb-6">Get started with our extensive production music library today</p>
                            <div className="space-y-2">
                                <p className="text-orange-500 font-semibold">Contact our licensing team:</p>
                                <p className="text-neutral-600">Email: <span className='hover:underline cursor-pointer'>info@cmmg.co.za</span></p>
                                <p className="text-neutral-600">Phone: +27 11 447 8870</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}