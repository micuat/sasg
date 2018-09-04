using System.Collections;
using System.Collections.Generic;
using UnityEngine;

//https://gist.github.com/Fonserbc/3d31a25e87fdaa541ddf
/* 
 * Functions taken from Tween.js - Licensed under the MIT license
 * at https://github.com/sole/tween.js
 */
public class Easing
{

    public static float Linear(float k)
    {
        return k;
    }

    public class Quadratic
    {
        public static float In(float k)
        {
            return k * k;
        }

        public static float Out(float k)
        {
            return k * (2f - k);
        }

        public static float InOut(float k)
        {
            if ((k *= 2f) < 1f) return 0.5f * k * k;
            return -0.5f * ((k -= 1f) * (k - 2f) - 1f);
        }
    };

    public class Cubic
    {
        public static float In(float k)
        {
            return k * k * k;
        }

        public static float Out(float k)
        {
            return 1f + ((k -= 1f) * k * k);
        }

        public static float InOut(float k)
        {
            if ((k *= 2f) < 1f) return 0.5f * k * k * k;
            return 0.5f * ((k -= 2f) * k * k + 2f);
        }
    };

    public class Quartic
    {
        public static float In(float k)
        {
            return k * k * k * k;
        }

        public static float Out(float k)
        {
            return 1f - ((k -= 1f) * k * k * k);
        }

        public static float InOut(float k)
        {
            if ((k *= 2f) < 1f) return 0.5f * k * k * k * k;
            return -0.5f * ((k -= 2f) * k * k * k - 2f);
        }
    };

    public class Quintic
    {
        public static float In(float k)
        {
            return k * k * k * k * k;
        }

        public static float Out(float k)
        {
            return 1f + ((k -= 1f) * k * k * k * k);
        }

        public static float InOut(float k)
        {
            if ((k *= 2f) < 1f) return 0.5f * k * k * k * k * k;
            return 0.5f * ((k -= 2f) * k * k * k * k + 2f);
        }
    };

    public class Sinusoidal
    {
        public static float In(float k)
        {
            return 1f - Mathf.Cos(k * Mathf.PI / 2f);
        }

        public static float Out(float k)
        {
            return Mathf.Sin(k * Mathf.PI / 2f);
        }

        public static float InOut(float k)
        {
            return 0.5f * (1f - Mathf.Cos(Mathf.PI * k));
        }
    };

    public class Exponential
    {
        public static float In(float k)
        {
            return k == 0f ? 0f : Mathf.Pow(1024f, k - 1f);
        }

        public static float Out(float k)
        {
            return k == 1f ? 1f : 1f - Mathf.Pow(2f, -10f * k);
        }

        public static float InOut(float k)
        {
            if (k == 0f) return 0f;
            if (k == 1f) return 1f;
            if ((k *= 2f) < 1f) return 0.5f * Mathf.Pow(1024f, k - 1f);
            return 0.5f * (-Mathf.Pow(2f, -10f * (k - 1f)) + 2f);
        }
    };

    public class Circular
    {
        public static float In(float k)
        {
            return 1f - Mathf.Sqrt(1f - k * k);
        }

        public static float Out(float k)
        {
            return Mathf.Sqrt(1f - ((k -= 1f) * k));
        }

        public static float InOut(float k)
        {
            if ((k *= 2f) < 1f) return -0.5f * (Mathf.Sqrt(1f - k * k) - 1);
            return 0.5f * (Mathf.Sqrt(1f - (k -= 2f) * k) + 1f);
        }
    };

    public class Elastic
    {
        public static float In(float k)
        {
            if (k == 0) return 0;
            if (k == 1) return 1;
            return -Mathf.Pow(2f, 10f * (k -= 1f)) * Mathf.Sin((k - 0.1f) * (2f * Mathf.PI) / 0.4f);
        }

        public static float Out(float k)
        {
            if (k == 0) return 0;
            if (k == 1) return 1;
            return Mathf.Pow(2f, -10f * k) * Mathf.Sin((k - 0.1f) * (2f * Mathf.PI) / 0.4f) + 1f;
        }

        public static float InOut(float k)
        {
            if ((k *= 2f) < 1f) return -0.5f * Mathf.Pow(2f, 10f * (k -= 1f)) * Mathf.Sin((k - 0.1f) * (2f * Mathf.PI) / 0.4f);
            return Mathf.Pow(2f, -10f * (k -= 1f)) * Mathf.Sin((k - 0.1f) * (2f * Mathf.PI) / 0.4f) * 0.5f + 1f;
        }
    };

    public class Back
    {
        static float s = 1.70158f;
        static float s2 = 2.5949095f;

        public static float In(float k)
        {
            return k * k * ((s + 1f) * k - s);
        }

        public static float Out(float k)
        {
            return (k -= 1f) * k * ((s + 1f) * k + s) + 1f;
        }

        public static float InOut(float k)
        {
            if ((k *= 2f) < 1f) return 0.5f * (k * k * ((s2 + 1f) * k - s2));
            return 0.5f * ((k -= 2f) * k * ((s2 + 1f) * k + s2) + 2f);
        }
    };

    public class Bounce
    {
        public static float In(float k)
        {
            return 1f - Out(1f - k);
        }

        public static float Out(float k)
        {
            if (k < (1f / 2.75f))
            {
                return 7.5625f * k * k;
            }
            else if (k < (2f / 2.75f))
            {
                return 7.5625f * (k -= (1.5f / 2.75f)) * k + 0.75f;
            }
            else if (k < (2.5f / 2.75f))
            {
                return 7.5625f * (k -= (2.25f / 2.75f)) * k + 0.9375f;
            }
            else
            {
                return 7.5625f * (k -= (2.625f / 2.75f)) * k + 0.984375f;
            }
        }

        public static float InOut(float k)
        {
            if (k < 0.5f) return In(k * 2f) * 0.5f;
            return Out(k * 2f - 1f) * 0.5f + 0.5f;
        }
    };
}

public class BaseLFO : MonoBehaviour {
    protected float lfo0;
    protected float lfo1;
    protected float lfo2;
    protected float lfo3;

    public float lfoSpeed0 = 0;
    public float lfoSpeed1 = 0;
    public float lfoSpeed2 = 0;
    public float lfoSpeed3 = 0;

    public float lfoAmp0 = 0;
    public float lfoAmp1 = 0;
    public float lfoAmp2 = 0;
    public float lfoAmp3 = 0;

    //public LFOManager manager; 
    protected float t0;
    protected float t1;
    protected float t2;
    protected float t3;

    // Use this for initialization
	void Start () {
		
	}

    // Update is called once per frame
    void Update()
    {
    }

    protected void UpdateTime() {
        t0 = Time.time * lfoSpeed0 - Mathf.Floor(Time.time * lfoSpeed0);
        if (Mathf.Floor(Time.time * lfoSpeed0) % 2 < 1)
        {
            t0 = 1.0f - t0;
        }

        t1 = Time.time * lfoSpeed1 - Mathf.Floor(Time.time * lfoSpeed1);
        if (Mathf.Floor(Time.time * lfoSpeed1) % 2 < 1)
        {
            t1 = 1.0f - t1;
        }

        t2 = Time.time * lfoSpeed2 - Mathf.Floor(Time.time * lfoSpeed2);
        if (Mathf.Floor(Time.time * lfoSpeed2) % 2 < 1)
        {
            t2 = 1.0f - t2;
        }

        t3 = Time.time * lfoSpeed3 - Mathf.Floor(Time.time * lfoSpeed3);
        if (Mathf.Floor(Time.time * lfoSpeed3) % 2 < 1)
        {
            t3 = 1.0f - t3;
        }
    }
}
