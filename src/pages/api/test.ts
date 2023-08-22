import { apiSwitchHandler } from "@/utils/api"
import { getToken } from "next-auth/jwt"
import { NextApiRequest, NextApiResponse } from "next/types"

// export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
// 	// const token = await getToken({ req })
// 	const session = await getServerSession(req, res, authOptions)
// 	if (session) {
// 		// Signed in
// 		// console.log("API: Session", JSON.stringify(session, null, 2))
// 		res.status(200).json(session)
// 	} else {
// 		// Not Signed in
// 		res.status(401)
// 	}
// 	res.end()
// }

abstract class Handler {
	prop1: string
	constructor() {
		this.prop1 = ""
	}
}

// const h

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	// await requireAuth(req, res)
	// console.log(req.headers['x-role'])
	// res.json({
	// 	data: req.headers['x-role'],
	// })
	await apiSwitchHandler(req, res, {
		GET: (q,r) => r.status(200).json('not')
	})
}


async function x(req: NextApiRequest, res: NextApiResponse) {
	const r = await fetch('https://jsonplaceholder.typicode.com/users')
	const rr = await r.json()
	res.status(200).json(rr)
}

// const requiresAuth = createMiddlewareDecorator(
// 	async (req: NextApiRequest, res: NextApiResponse, next: NextFunction) => {
// 	  const session = await getSession({ req });

// 	  if (!session) {
// 		throw new UnauthorizedException();
// 	  }

// 	  next();
// 	}
//   );

const requireAuth = async (req: NextApiRequest, res: NextApiResponse) => {
	const token = await getToken({ req })
	if (!token) return res.status(401).end() 
	// if (token.role === "ROOT") return res.status(403).end()
	// return res.status(401).end()

}

// type SwitchHandlerMethod = "GET" | "POST"
// type A = {
// 	[key in SwitchHandlerMethod]?: (req: NextApiRequest, res: NextApiResponse, a: string) => void
// }
// const switchHandler = (req: NextApiRequest, res: NextApiResponse, handler: A) => {
// 	switch (req.method) {
// 		case 'GET':
// 		  //some code...
// 		  if (handler.GET) {
// 			handler.GET(req, res, 'w')
// 		  } else
// 		  res.status(405).end(`${req.method} Not Allowed`);
// 		//   res.status(200).json({})
// 		  break;

// 		case 'POST':
// 		  //some code...
// 		  res.status(201).json({})
// 		  break;

// 		case 'PATCH':
// 		  //some code...
// 		  res.status(200).json({})
// 		  break;

// 		default:
// 		  res.status(405).end(`${req.method} Not Allowed`);
// 		  break;
// 	  }
// }


/*
  export default function handler(req, res) {
        switch (req.method) {
          case 'GET':
            //some code...
            res.status(200).json({//response object})
            break;

          case 'POST':
            //some code...
            res.status(201).json({//response object})
            break;

          case 'PATCH':
            //some code...
            res.status(200).json({//response object})
            break;

          default:
            res.status(405).end(`${method} Not Allowed`);
            break;
        }
      }
	  */