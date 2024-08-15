/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        staleTimes: {
            dynamic: 30,
        },
    },
    serverExternalPackages: ["@node-rs/argon2"], // IMP: needs to be added since lucia uses this for login and signup
};

export default nextConfig;
