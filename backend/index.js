const express = require('express');
const app = express();
const jwt = require('jsonwebtoken');
require('dotenv').config();
const stripe = require('stripe')(process.env.PAYMENT_SECRET);
const cors = require('cors');
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
// Middleware
app.use(cors());
app.use(express.json());

// Routes
// SET TOKEN .
const verifyJWT = (req, res, next) => {
    const authorization = req.headers.authorization;
    if (!authorization) {
        return res.status(401).send({ error: true, message: 'Unauthorize access' })
    }
    const token = authorization?.split(' ')[1]
    jwt.verify(token, process.env.ACCESS_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).send({ error: true, message: 'forbidden user or token has expired' })
        }
        req.decoded = decoded;
        next()
    })
}

// MONGO DB ROUTES

const uri = "mongodb+srv://rifathasanshawoon:H8xeo79FkZh5wrhe@cluster0.3avmb3u.mongodb.net/workout-master?appName=Cluster0";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        const database = client.db("workout-master");
        const userCollection = database.collection("users");
        const PackagesCollection = database.collection("Packages");
        const cartCollection = database.collection("cart");
        const enrolledCollection = database.collection("enrolled");
        const paymentCollection = database.collection("payments");
        const appliedCollection = database.collection("applied");
        client.connect();

        // Verify admin
        const verifyAdmin = async (req, res, next) => {
            const email = req.decoded.email;
            const query = { email: email };
            const user = await userCollection.findOne(query);
            if (user.role === 'admin') {
                next()
            }
            else {
                return res.status(401).send({ error: true, message: 'Unauthorize access' })
            }
        }

        const verifyInstructor = async (req, res, next) => {
            const email = req.decoded.email;
            const query = { email: email };
            const user = await userCollection.findOne(query);
            if (user.role === 'instructor' || user.role === 'admin') {
                next()
            }
            else {
                return res.status(401).send({ error: true, message: 'Unauthorize access' })
            }
        }


        app.post('/new-user', async (req, res) => {
            const newUser = req.body;

            const result = await userCollection.insertOne(newUser);
            res.send(result);
        })
        app.post('/api/set-token', (req, res) => {
            const user = req.body;
            const token = jwt.sign(user, process.env.ACCESS_SECRET, { expiresIn: '24h' })
            res.send({ token })
        })


        // GET ALL USERS
        app.get('/users', async (req, res) => {
            const users = await userCollection.find({}).toArray();
            res.send(users);
        })
        // GET USER BY ID
        app.get('/users/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const user = await userCollection.findOne(query);
            res.send(user);
        })
        // GET USER BY EMAIL
        app.get('/user/:email', verifyJWT, async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const result = await userCollection.findOne(query);
            res.send(result);
        })
        // Delete a user

        app.delete('/delete-user/:id', verifyJWT, verifyAdmin, async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await userCollection.deleteOne(query);
            res.send(result);
        })
        // UPDATE USER
        app.put('/update-user/:id', verifyJWT, verifyAdmin, async (req, res) => {
            const id = req.params.id;
            const updatedUser = req.body;
            const filter = { _id: new ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    name: updatedUser.name,
                    email: updatedUser.email,
                    role: updatedUser.option,
                    address: updatedUser.address,
                    phone: updatedUser.phone,
                    about: updatedUser.about,
                    photoUrl: updatedUser.photoUrl,
                    skills: updatedUser.skills ? updatedUser.skills : null,
                }
            }
            const result = await userCollection.updateOne(filter, updateDoc, options);
            res.send(result);
        })


        // ! PACKAGES ROUTES


        app.post('/new-Package', verifyJWT, verifyInstructor, async (req, res) => {
            const newPackage = req.body;
            newPackage.availableSeats = parseInt(newPackage.availableSeats)
            const result = await PackagesCollection.insertOne(newPackage);
            res.send(result);
        });

        // GET ALL PACKAGES ADDED BY INSTRUCTOR
        app.get('/Packages/:email', verifyJWT, verifyInstructor, async (req, res) => {
            const email = req.params.email;
            const query = { instructorEmail: email };
            const result = await PackagesCollection.find(query).toArray();
            res.send(result);
        })

        // GET ALL PACKAGES
        app.get('/Packages', async (req, res) => {
            const query = { status: 'approved' };
            const result = await PackagesCollection.find(query).toArray();
            res.send(result);
        })
        app.get('/Packages-manage', async (req, res) => {
            const result = await PackagesCollection.find().toArray();
            res.send(result);
        })

        // Change status of a package
        app.put('/change-status/:id', verifyJWT, verifyAdmin, async (req, res) => {
            const id = req.params.id;
            const status = req.body.status;
            console.log(req.body)
            const reason = req.body.reason;
            const filter = { _id: new ObjectId(id) };
            console.log("🚀 ~ file: index.js:180 ~ app.put ~ reason:", reason)
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    status: status,
                    reason: reason
                }
            }
            const result = await PackagesCollection.updateOne(filter, updateDoc, options);
            res.send(result);
        })
        // * GET APPROVED PACKAGES
        app.get('/approved-Packages', async (req, res) => {
            const query = { status: 'approved' };
            const result = await PackagesCollection.find(query).toArray();
            res.send(result);
        })

        // GET ALL INSTRUCTORS
        app.get('/instructors', async (req, res) => {
            const query = { role: 'instructor' };
            const result = await userCollection.find(query).toArray();
            res.send(result);
        })

        // Update a Packages
        app.put('/update-Package/:id', verifyJWT, verifyInstructor, async (req, res) => {
            const id = req.params.id;
            const updatedPackage = req.body;
            const filter = { _id: new ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    name: updatedPackage.name,
                    description: updatedPackage.description,
                    price: updatedPackage.price,
                    availableSeats: parseInt(updatedPackage.availableSeats),
                    videoLink: updatedPackage.videoLink,
                    status: 'pending'
                }
            }
            const result = await PackagesCollection.updateOne(filter, updateDoc, options);
            res.send(result);
        })


        // Get single Package by id for details page
        app.get('/Package/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await PackagesCollection.findOne(query);
            res.send(result);
        })
        // ! CART ROUTES

        // ADD TO CART
        app.post('/add-to-cart', verifyJWT, async (req, res) => {
            const newCartItem = req.body;
            const result = await cartCollection.insertOne(newCartItem);
            res.send(result);
        })
        // Get cart item id for checking if a class is already in cart
        app.get('/cart-item/:id', verifyJWT, async (req, res) => {
            const id = req.params.id;
            const email = req.query.email;
            const query = { PackageId: id, userMail: email };
            const projection = { PackageId: 1 };
            const result = await cartCollection.findOne(query, { projection: projection });
            res.send(result);
        })

        app.get('/cart/:email', verifyJWT, async (req, res) => {
            const email = req.params.email;
            const query = { userMail: email };
            const projection = { PackageId: 1 };
            const carts = await cartCollection.find(query, { projection: projection }).toArray();
            const PackageIds = carts.map(cart => new ObjectId(cart.PackageId));
            const query2 = { _id: { $in: PackageIds } };
            const result = await PackagesCollection.find(query2).toArray();
            res.send(result);
        })

        // Delete a item form cart
        app.delete('/delete-cart-item/:id', verifyJWT, async (req, res) => {
            const id = req.params.id;
            const query = { PackageId: id };
            const result = await cartCollection.deleteOne(query);
            res.send(result);
        })
        // PAYMENT ROUTES
        app.post('/create-payment-intent', verifyJWT, async (req, res) => {
            const { price } = req.body;
            const amount = parseInt(price) * 100;
            const paymentIntent = await stripe.paymentIntents.create({
                amount: amount,
                currency: 'usd',
                payment_method_types: ['card']
            });
            res.send({
                clientSecret: paymentIntent.client_secret
            });
        })
        // POST PAYMENT INFO 
        app.post('/payment-info', verifyJWT, async (req, res) => {
            const paymentInfo = req.body;
            const PackagesId = paymentInfo.PackagesId;
            const userEmail = paymentInfo.userEmail;
            const singlePackageId = req.query.PackageId;
            let query;
            // const query = { classId: { $in: classesId } };
            if (singlePackageId) {
                query = { PackageId: singlePackageId, userMail: userEmail };
            } else {
                query = { PackageId: { $in: PackagesId } };
            }
            const PackagesQuery = { _id: { $in: PackagesId.map(id => new ObjectId(id)) } }
            const Packages = await PackagesCollection.find(PackagesQuery).toArray();
            const newEnrolledData = {
                userEmail: userEmail,
                PackagesId: PackagesId.map(id => new ObjectId(id)),
                transactionId: paymentInfo.transactionId,
            }
            const updatedDoc = {
                $set: {
                    totalEnrolled: Packages.reduce((total, current) => total + current.totalEnrolled, 0) + 1 || 0,
                    availableSeats: Packages.reduce((total, current) => total + current.availableSeats, 0) - 1 || 0,
                }
            }
            // const updatedInstructor = await userCollection.find()
            const updatedResult = await PackagesCollection.updateMany(PackagesQuery, updatedDoc, { upsert: true });
            const enrolledResult = await enrolledCollection.insertOne(newEnrolledData);
            const deletedResult = await cartCollection.deleteMany(query);
            const paymentResult = await paymentCollection.insertOne(paymentInfo);
            res.send({ paymentResult, deletedResult, enrolledResult, updatedResult });
        })


        app.get('/payment-history/:email', async (req, res) => {
            const email = req.params.email;
            const query = { userEmail: email };
            const result = await paymentCollection.find(query).sort({ date: -1 }).toArray();
            res.send(result);
        })


        app.get('/payment-history-length/:email', async (req, res) => {
            const email = req.params.email;
            const query = { userEmail: email };
            const total = await paymentCollection.countDocuments(query);
            res.send({ total });
        })


        // ! ENROLLED ROUTES
        /*

        app.get('/popular-Packages', async (req, res) => {
            const result = await PackagesCollection.find().sort({ totalEnrolled: -1 }).limit(6).toArray();
            res.send(result);
        })
          */
        app.get('/popular-Packages', verifyJWT, async (req, res) => {
            try {
              const result = await PackagesCollection.find().sort({ totalEnrolled: -1 }).limit(6).toArray();
              res.send(result);
            } catch (error) {
              console.error(error);
              res.status(500).send({ error: 'Failed to fetch popular packages' });
            }
          });  


        app.get('/popular-instructors', async (req, res) => {
            const pipeline = [
                {
                    $group: {
                        _id: "$instructorEmail",
                        totalEnrolled: { $sum: "$totalEnrolled" },
                    }
                },
                {
                    $lookup: {
                        from: "users",
                        localField: "_id",
                        foreignField: "email",
                        as: "instructor"
                    }
                },
                {
                    $project: {
                        _id: 0,
                        instructor: {
                            $arrayElemAt: ["$instructor", 0]
                        },
                        totalEnrolled: 1
                    }
                },
                {
                    $sort: {
                        totalEnrolled: -1
                    }
                },
                {
                    $limit: 6
                }
            ]
            const result = await PackagesCollection.aggregate(pipeline).toArray();
            res.send(result);

        })

        // Admins stats 
        app.get('/admin-stats', verifyJWT, verifyAdmin, async (req, res) => {
            // Get approved classes and pending classes and instructors 
            const approvedPackages = (await PackagesCollection.find({ status: 'approved' }).toArray()).length;
            const pendingPackages = (await PackagesCollection.find({ status: 'pending' }).toArray()).length;
            const instructors = (await userCollection.find({ role: 'instructor' }).toArray()).length;
            const totalPackages = (await PackagesCollection.find().toArray()).length;
            const totalEnrolled = (await enrolledCollection.find().toArray()).length;
            // const totalRevenue = await paymentCollection.find().toArray();
            // const totalRevenueAmount = totalRevenue.reduce((total, current) => total + parseInt(current.price), 0);
            const result = {
                approvedPackages,
                pendingPackages,
                instructors,
                totalPackages,
                totalEnrolled,
                // totalRevenueAmount
            }
            res.send(result);

        })

        // !GET ALL INSTrUCTOR  

        app.get('/instructors', async (req, res) => {
            const result = await userCollection.find({ role: 'instructor' }).toArray();
            res.send(result);
        })




        app.get('/enrolled-Packages/:email', verifyJWT, async (req, res) => {
            const email = req.params.email;
            const query = { userEmail: email };
                const pipeline = [
                {
                    $match: query
                },
                {
                    $lookup: {
                        from: "Packages",
                        localField: "PackagesId",
                        foreignField: "_id",
                        as: "Packages"
                    }
                },
                {
                    $unwind: "$Packages"
                },
                {
                    $lookup: {
                        from: "users",
                        localField: "Packages.instructorEmail",
                        foreignField: "email",
                        as: "instructor"
                    }
                },
                {
                    $project: {
                        _id: 0,
                        Packages: 1,
                        instructor: {
                            $arrayElemAt: ["$instructor", 0]
                        }
                    }
                }

            ]
            const result = await enrolledCollection.aggregate(pipeline).toArray();
            // const result = await enrolledCollection.find(query).toArray();
            res.send(result);
        })

        // Applied route 
        app.post('/as-instructor', async (req, res) => {
            const data = req.body;
            const result = await appliedCollection.insertOne(data);
            res.send(result);
        })
        app.get('/applied-instructors/:email',   async (req, res) => {
            const email = req.params.email;
            const result = await appliedCollection.findOne({email});
            res.send(result);
        });
        // Send a ping to confirm a successful connection
        // await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('workout Master Server is running!');
})


// Listen
app.listen(port, () => {
    console.log(`SERVER IS RUNNING ON PORT ${port}`);
})

